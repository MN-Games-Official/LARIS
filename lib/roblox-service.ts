// ─── Roblox Service ───────────────────────────────────────────────────────────
// Handles all Roblox Cloud API interactions

export interface RobloxMembership {
  path: string;
  user: string;
  role: string;
  joinedAt: string;
}

export interface RobloxRole {
  id: number;
  name: string;
  rank: number;
  memberCount: number;
}

export interface PromotionResult {
  success: boolean;
  membership?: RobloxMembership;
  error?: string;
}

export class RobloxService {
  private apiKey: string;
  private cloudBase = 'https://apis.roblox.com';
  private groupsBase = 'https://groups.roblox.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // ─── Get Group Membership ─────────────────────────────────────────────────

  async getMembership(groupId: string, userId: string): Promise<RobloxMembership | null> {
    const filter = encodeURIComponent(`user=='users/${userId}'`);
    const url = `${this.cloudBase}/cloud/v2/groups/${groupId}/memberships?maxPageSize=1&filter=${filter}`;

    const response = await fetch(url, {
      headers: { 'x-api-key': this.apiKey },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to get membership: ${response.status} ${errText}`);
    }

    const data = await response.json();
    return data.groupMemberships?.[0] ?? null;
  }

  // ─── Get All Group Memberships ────────────────────────────────────────────

  async getGroupMembers(groupId: string, pageToken?: string): Promise<{
    memberships: RobloxMembership[];
    nextPageToken?: string;
  }> {
    let url = `${this.cloudBase}/cloud/v2/groups/${groupId}/memberships?maxPageSize=100`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const response = await fetch(url, {
      headers: { 'x-api-key': this.apiKey },
    });

    if (!response.ok) throw new Error(`Failed to get members: ${response.status}`);

    const data = await response.json();
    return {
      memberships: data.groupMemberships || [],
      nextPageToken: data.nextPageToken,
    };
  }

  // ─── Get Roles Map (rank number → role ID) ────────────────────────────────

  async getRolesMap(groupId: string): Promise<Record<number, number>> {
    const response = await fetch(
      `${this.groupsBase}/v1/groups/${groupId}/roles`
    );

    if (!response.ok) throw new Error(`Failed to get roles: ${response.status}`);

    const data = await response.json();
    const map: Record<number, number> = {};

    for (const role of data.roles ?? []) {
      map[role.rank] = role.id;
    }

    return map;
  }

  // ─── Get All Roles ────────────────────────────────────────────────────────

  async getRoles(groupId: string): Promise<RobloxRole[]> {
    const response = await fetch(
      `${this.groupsBase}/v1/groups/${groupId}/roles`
    );

    if (!response.ok) throw new Error(`Failed to get roles: ${response.status}`);

    const data = await response.json();
    return data.roles ?? [];
  }

  // ─── Promote User ─────────────────────────────────────────────────────────

  async promoteUser(
    groupId: string,
    membershipId: string,
    targetRank: number | string
  ): Promise<PromotionResult> {
    try {
      const rolesMap = await this.getRolesMap(groupId);

      let roleId: number;
      if (typeof targetRank === 'number') {
        roleId = rolesMap[targetRank];
        if (!roleId) throw new Error(`Rank ${targetRank} not found in group ${groupId}`);
      } else if (targetRank.startsWith('rank:')) {
        const rank = parseInt(targetRank.replace('rank:', '').trim());
        roleId = rolesMap[rank];
        if (!roleId) throw new Error(`Rank ${rank} not found in group ${groupId}`);
      } else if (targetRank.includes('roles/')) {
        // Direct role path provided
        roleId = parseInt(targetRank.split('roles/')[1]);
      } else {
        roleId = parseInt(targetRank);
      }

      const membershipPath = membershipId.includes('groups/')
        ? membershipId
        : `groups/${groupId}/memberships/${membershipId}`;

      const url = `${this.cloudBase}/cloud/v2/${membershipPath}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: `groups/${groupId}/roles/${roleId}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        return { success: false, error: error.message || `HTTP ${response.status}` };
      }

      const membership = await response.json();
      return { success: true, membership };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Validate API Key ─────────────────────────────────────────────────────

  async validateApiKey(groupId?: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Try to list memberships for a public group or use provided group ID
      const testGroupId = groupId || '1'; // Use group ID 1 as test target
      const url = `${this.cloudBase}/cloud/v2/groups/${testGroupId}/memberships?maxPageSize=1`;

      const response = await fetch(url, {
        headers: { 'x-api-key': this.apiKey },
      });

      if (response.status === 401) return { valid: false, error: 'Invalid API key' };
      if (response.status === 403) return { valid: false, error: 'API key lacks required permissions' };
      // 404 = group not found, but key is valid
      if (response.status === 404 || response.ok) return { valid: true };

      return { valid: false, error: `Unexpected response: ${response.status}` };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }
}

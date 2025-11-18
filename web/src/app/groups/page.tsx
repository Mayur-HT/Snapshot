"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  UserPlus,
  Share2,
  Loader2,
  X,
  Mail,
  Copy,
  Trash2,
  Check,
} from "lucide-react";
import AuthGuard from "../../components/AuthGuard";
import {
  createGroup,
  getGroups,
  addGroupMember,
  removeGroupMember,
  createGroupInvite,
  deleteGroup,
  me,
} from "../../lib/api";

interface GroupMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    selfieUrl: string;
  };
}

interface Group {
  id: string;
  name: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: GroupMember[];
  _count?: {
    members: number;
  };
}

function GroupsPageContent() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState<string | null>(
    null
  );
  const [groupName, setGroupName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUser();
    loadGroups();
  }, []);

  async function loadUser() {
    try {
      const userData = await me();
      setCurrentUserId(userData.id);
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  }

  async function loadGroups() {
    try {
      setLoading(true);
      const data = await getGroups();
      setGroups(data.groups || []);
    } catch (err: any) {
      setError(err.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      setError("");
      await createGroup(groupName.trim());
      setGroupName("");
      setShowCreateModal(false);
      await loadGroups();
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    }
  }

  async function handleInvite(groupId: string) {
    try {
      setError("");
      const result = await createGroupInvite(groupId, inviteEmail || undefined);
      setInviteLink(result.invite.inviteUrl);
      setInviteEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to create invite");
    }
  }

  async function handleAddMember(groupId: string) {
    if (!memberEmail.trim()) return;

    try {
      setError("");
      await addGroupMember(groupId, memberEmail.trim());
      setMemberEmail("");
      setShowAddMemberModal(null);
      await loadGroups();
    } catch (err: any) {
      setError(err.message || "Failed to add member");
    }
  }

  async function handleRemoveMember(groupId: string, userId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      setError("");
      await removeGroupMember(groupId, userId);
      await loadGroups();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    }
  }

  async function handleDeleteGroup(groupId: string) {
    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    )
      return;

    try {
      setError("");
      await deleteGroup(groupId);
      await loadGroups();
    } catch (err: any) {
      setError(err.message || "Failed to delete group");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-pink-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg flex items-center gap-3">
            <Users size={32} className="text-pink-400" />
            Groups
          </h1>
          <p className="text-gray-300">
            Create and manage groups for sharing photos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:scale-105"
        >
          <Plus size={20} />
          <span>Create Group</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="relative z-10 bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No groups yet
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create groups to organize your photo sharing. Add members and
            automatically share photos with everyone in the group. Perfect for
            family events, trips, and special occasions!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:scale-105"
          >
            <Plus size={20} />
            <span>Create Your First Group</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {group.members.length}{" "}
                    {group.members.length === 1 ? "member" : "members"}
                  </p>
                </div>
                {group.ownerId === currentUserId && (
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Delete group"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Owner:</span>{" "}
                  {group.owner.name}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.members.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1"
                    >
                      <img
                        src={member.user.selfieUrl}
                        alt={member.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-gray-300">
                        {member.user.name}
                      </span>
                      {group.ownerId === currentUserId &&
                        member.user.id !== group.ownerId && (
                          <button
                            onClick={() =>
                              handleRemoveMember(group.id, member.user.id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={14} />
                          </button>
                        )}
                    </div>
                  ))}
                  {group.members.length > 5 && (
                    <div className="text-xs text-gray-400 flex items-center px-2 py-1">
                      +{group.members.length - 5} more
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowInviteModal(group.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-lg transition-all duration-200"
                >
                  <Mail size={16} />
                  Invite
                </button>
                <button
                  onClick={() => setShowAddMemberModal(group.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200"
                >
                  <UserPlus size={16} />
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              Create New Group
            </h2>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-pink-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setGroupName("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Invite to Group</h2>
              <button
                onClick={() => {
                  setShowInviteModal(null);
                  setInviteLink("");
                  setInviteEmail("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            {!inviteLink ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInvite(showInviteModal);
                }}
              >
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-pink-500"
                />
                <p className="text-sm text-gray-400 mb-4">
                  Leave empty to generate a shareable link, or enter an email to
                  send the invite directly.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(null);
                      setInviteLink("");
                      setInviteEmail("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Generate Link
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-300 mb-4">
                  Share this link to invite people to the group:
                </p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteLink)}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="Copy link"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowInviteModal(null);
                    setInviteLink("");
                    setInviteEmail("");
                  }}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Add Member</h2>
              <button
                onClick={() => {
                  setShowAddMemberModal(null);
                  setMemberEmail("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddMember(showAddMemberModal);
              }}
            >
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="User email"
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-pink-500"
                autoFocus
                required
              />
              <p className="text-sm text-gray-400 mb-4">
                Enter the email address of the user you want to add to this
                group.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(null);
                    setMemberEmail("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <AuthGuard>
      <GroupsPageContent />
    </AuthGuard>
  );
}

export const ROLES = {
  owner: [
    "user:view",
    "user:soft_delete",
    "user:restore",
    "user:permanent_delete",
    "role:assign",
    "file:view:any",
    "file:update:any",
    "file:delete:any",
    "audit:view"
  ],

  admin: [
    "user:view",
    "user:soft_delete",
    "role:assign",
    "file:view:any",
  ],

  editor: [
    "file:view:any",
    "file:create:any",
    "file:update:any"
  ],

  user: [] // implicit
};

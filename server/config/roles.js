export const ROLES = {
  Owner: [
    "user:view",
    "user:soft_delete",
    "user:restore",
    "user:permanent_delete",
    "role:assign",
    "file:view:any",
    "file:update:any",
    "file:delete:any",
    "audit:view",
    "role:assign:any",
  ],

  Admin: [
    "user:view",
    "user:soft_delete",
    "role:assign",
    "file:view:any",
    "role:assign:limited",
  ],

  Editor: [
    "user:view",
    "file:view:any",
    "file:create:any",
    "file:update:any",
    "role:assign:basic"
  ],

  User: [] // implicit
};



// constants/roleHierarchy.js
export const ROLE_HIERARCHY = {
  User: 1,
  Editor: 2,
  Admin: 3,
  Owner: 4,
};

const mongoose = require("mongoose");

const Permission = require("../models/Permission");
const Role = require("../models/Role");

const PERMISSIONS = require("../enums/permission.enum");
const { ROLES } = require("./constants");

const permissionDescriptions = {
  USER_VIEW: "View users",
  USER_CREATE: "Create users",
  USER_UPDATE: "Update users",
  USER_DELETE: "Delete users",

  PRODUCT_VIEW: "View marketplace products",
  PRODUCT_CREATE: "Create marketplace products",
  PRODUCT_UPDATE: "Update marketplace products",
  PRODUCT_DELETE: "Delete marketplace products",

  INVENTORY_VIEW: "View inventory",
  INVENTORY_MANAGE: "Manage inventory",

  ORDER_VIEW: "View orders",
  ORDER_CREATE: "Create orders",
  ORDER_UPDATE: "Update orders",
  ORDER_CANCEL: "Cancel orders",

  BULK_ORDER_VIEW: "View bulk orders",
  BULK_ORDER_CREATE: "Create bulk orders",
  BULK_ORDER_UPDATE: "Update bulk orders",
  BULK_ORDER_CANCEL: "Cancel bulk orders",
  BULK_ORDER_MANAGE: "Manage bulk orders",

  FPO_MEMBER_VIEW: "View FPO members",
  FPO_MEMBER_MANAGE: "Manage FPO members",

  SETTLEMENT_VIEW: "View settlements",
  SETTLEMENT_MANAGE: "Manage settlements",

  LOGISTICS_JOB_VIEW: "View logistics jobs",
  LOGISTICS_JOB_ACCEPT: "Accept logistics jobs",
  LOGISTICS_JOB_UPDATE: "Update logistics jobs",

  ROUTE_VIEW: "View routes",
  ROUTE_OPTIMIZE: "Optimize logistics routes",

  SHIPMENT_VIEW: "View shipments",
  SHIPMENT_UPDATE: "Update shipments",

  PAYMENT_CREATE: "Create payments",

  REPORT_VIEW: "View reports",
  REPORT_GENERATE: "Generate reports",

  AUDIT_VIEW: "View audit logs",

  DASHBOARD_VIEW: "View dashboards"
};

const getModule = (permissionName) => {
  return permissionName.split("_")[0];
};

const rolePermissions = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  [ROLES.FARMER]: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,

    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,

    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_CANCEL,

    PERMISSIONS.SETTLEMENT_VIEW,

    PERMISSIONS.DASHBOARD_VIEW
  ],

  [ROLES.CONSUMER]: [
    PERMISSIONS.PRODUCT_VIEW,

    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_CANCEL,

    PERMISSIONS.PAYMENT_CREATE,

    PERMISSIONS.DASHBOARD_VIEW
  ],

  [ROLES.BULK_BUYER]: [
    PERMISSIONS.PRODUCT_VIEW,

    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,

    PERMISSIONS.BULK_ORDER_VIEW,
    PERMISSIONS.BULK_ORDER_CREATE,
    PERMISSIONS.BULK_ORDER_UPDATE,
    PERMISSIONS.BULK_ORDER_CANCEL,

    PERMISSIONS.PAYMENT_CREATE,

    PERMISSIONS.DASHBOARD_VIEW
  ],

  [ROLES.FPO]: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,

    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,

    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,

    PERMISSIONS.BULK_ORDER_VIEW,
    PERMISSIONS.BULK_ORDER_CREATE,
    PERMISSIONS.BULK_ORDER_MANAGE,

    PERMISSIONS.FPO_MEMBER_VIEW,
    PERMISSIONS.FPO_MEMBER_MANAGE,

    PERMISSIONS.SETTLEMENT_VIEW,
    PERMISSIONS.SETTLEMENT_MANAGE,

    PERMISSIONS.DASHBOARD_VIEW
  ],

  [ROLES.LOGISTICS]: [
    PERMISSIONS.LOGISTICS_JOB_VIEW,
    PERMISSIONS.LOGISTICS_JOB_ACCEPT,
    PERMISSIONS.LOGISTICS_JOB_UPDATE,

    PERMISSIONS.ROUTE_VIEW,
    PERMISSIONS.ROUTE_OPTIMIZE,

    PERMISSIONS.SHIPMENT_VIEW,
    PERMISSIONS.SHIPMENT_UPDATE,

    PERMISSIONS.DASHBOARD_VIEW
  ],

  [ROLES.GOVERNMENT_OFFICER]: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.ORDER_VIEW,

    PERMISSIONS.BULK_ORDER_VIEW,

    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_GENERATE,

    PERMISSIONS.AUDIT_VIEW,

    PERMISSIONS.DASHBOARD_VIEW
  ]
};

const roleDescriptions = {
  [ROLES.ADMIN]: "Platform administrator with full system access",

  [ROLES.FARMER]: "Farmer who sells agricultural produce",

  [ROLES.CONSUMER]: "Individual consumer who purchases agricultural produce",

  [ROLES.BULK_BUYER]:
    "Business or institutional buyer purchasing produce in bulk",

  [ROLES.FPO]: "Farmer Producer Organization managing aggregated farmer supply",

  [ROLES.LOGISTICS]:
    "Logistics manager or logistics partner handling deliveries",

  [ROLES.GOVERNMENT_OFFICER]:
    "Government officer responsible for monitoring and governance"
};

const seedRBAC = async () => {
  console.log("Seeding permissions...");

  const permissionDocuments = Object.values(PERMISSIONS).map(
    (permissionName) => ({
      name: permissionName,
      description:
        permissionDescriptions[permissionName] ||
        permissionName.replace(/_/g, " "),
      module: getModule(permissionName)
    })
  );

  await Permission.bulkWrite(
    permissionDocuments.map((permission) => ({
      updateOne: {
        filter: { name: permission.name },
        update: { $set: permission },
        upsert: true
      }
    }))
  );

  const permissions = await Permission.find();

  const permissionMap = new Map(
    permissions.map((permission) => [permission.name, permission._id])
  );

  console.log("Seeding roles...");

  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const permissionIds = permissionNames
      .map((permissionName) => permissionMap.get(permissionName))
      .filter(Boolean);

    await Role.updateOne(
      { name: roleName },
      {
        $set: {
          description: roleDescriptions[roleName],
          permissionIds,
          isSystemRole: true
        }
      },
      { upsert: true }
    );
  }

  console.log("RBAC seed completed");
};

module.exports = seedRBAC;

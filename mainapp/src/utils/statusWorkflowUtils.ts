/**
 * Status Workflow Utilities for Vanguard Cargo Logistics Application
 * 
 * This file contains comprehensive business rule validation and workflow management
 * utilities for package and shipment status transitions, including the new "arrived" status.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2024-10-02
 */

import { 
  PackageStatus, 
  ShipmentStatus, 
  PackageStatusUtils, 
  ShipmentStatusUtils,
  type PackageStatusValue,
  type ShipmentStatusValue 
} from '../types';

// ============================================================================
// BUSINESS RULE VALIDATION INTERFACES
// ============================================================================

/**
 * Interface for workflow validation results
 */
export interface WorkflowValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  rule?: string;
  suggestedActions?: string[];
}

/**
 * Interface for status transition context
 */
export interface StatusTransitionContext {
  entityId: string;
  entityType: 'package' | 'shipment';
  currentStatus: string;
  newStatus: string;
  userId?: string;
  userRole?: string;
  notes?: string;
  timestamp?: Date;
}

/**
 * Interface for workflow automation rules
 */
export interface WorkflowAutomationRule {
  trigger: string;
  conditions: Record<string, any>;
  actions: string[];
  notifications: string[];
}

// ============================================================================
// CORE WORKFLOW VALIDATION CLASS
// ============================================================================

/**
 * Comprehensive workflow validation and business rule engine
 * Handles complex business logic for status transitions and workflow automation
 */
export class StatusWorkflowValidator {
  
  /**
   * Validate a package status transition with comprehensive business rules
   * @param context - The transition context
   * @returns Validation result with detailed feedback
   */
  static validatePackageTransition(context: StatusTransitionContext): WorkflowValidationResult {
    const { currentStatus, newStatus, userRole, userId } = context;
    
    // Basic transition validation using PackageStatusUtils
    const basicValidation = PackageStatusUtils.isValidTransition(
      currentStatus as PackageStatusValue,
      newStatus as PackageStatusValue
    );

    if (!basicValidation) {
      const validNextStatuses = PackageStatusUtils.getValidNextStatuses(currentStatus as PackageStatusValue);
      return {
        isValid: false,
        error: `Invalid transition from '${currentStatus}' to '${newStatus}'`,
        suggestedActions: [`Valid next statuses: ${validNextStatuses.join(', ')}`]
      };
    }

    // Role-based validation
    const roleValidation = this.validateRolePermissions(newStatus, userRole, 'package');
    if (!roleValidation.isValid) {
      return roleValidation;
    }

    // Business-specific validations
    const businessValidation = this.validatePackageBusinessRules(context);
    if (!businessValidation.isValid) {
      return businessValidation;
    }

    // Get transition rule for successful validation
    const rule = PackageStatusUtils.getTransitionRule(
      currentStatus as PackageStatusValue,
      newStatus as PackageStatusValue
    );

    return {
      isValid: true,
      rule: rule || undefined,
      suggestedActions: this.getSuggestedActions(newStatus, 'package')
    };
  }

  /**
   * Validate a shipment status transition with comprehensive business rules
   * @param context - The transition context
   * @returns Validation result with detailed feedback
   */
  static validateShipmentTransition(context: StatusTransitionContext): WorkflowValidationResult {
    const { currentStatus, newStatus, userRole } = context;
    
    // Basic transition validation using ShipmentStatusUtils
    const basicValidation = ShipmentStatusUtils.isValidTransition(
      currentStatus as ShipmentStatusValue,
      newStatus as ShipmentStatusValue
    );

    if (!basicValidation) {
      const validNextStatuses = ShipmentStatusUtils.getValidNextStatuses(currentStatus as ShipmentStatusValue);
      return {
        isValid: false,
        error: `Invalid transition from '${currentStatus}' to '${newStatus}'`,
        suggestedActions: [`Valid next statuses: ${validNextStatuses.join(', ')}`]
      };
    }

    // Role-based validation
    const roleValidation = this.validateRolePermissions(newStatus, userRole, 'shipment');
    if (!roleValidation.isValid) {
      return roleValidation;
    }

    // Business-specific validations
    const businessValidation = this.validateShipmentBusinessRules(context);
    if (!businessValidation.isValid) {
      return businessValidation;
    }

    // Get transition rule for successful validation
    const rule = ShipmentStatusUtils.getTransitionRule(
      currentStatus as ShipmentStatusValue,
      newStatus as ShipmentStatusValue
    );

    return {
      isValid: true,
      rule: rule || undefined,
      suggestedActions: this.getSuggestedActions(newStatus, 'shipment')
    };
  }

  /**
   * Validate role-based permissions for status transitions
   * @param newStatus - The desired new status
   * @param userRole - The user's role
   * @param entityType - Type of entity (package or shipment)
   * @returns Validation result
   */
  private static validateRolePermissions(
    newStatus: string,
    userRole: string | undefined,
    entityType: 'package' | 'shipment'
  ): WorkflowValidationResult {
    if (!userRole) {
      return {
        isValid: false,
        error: 'User role is required for status transitions'
      };
    }

    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      'client': [], // Clients cannot directly change statuses
      'warehouse_admin': [
        // Package statuses warehouse admins can set
        PackageStatus.ARRIVED,
        PackageStatus.INSPECTED,
        PackageStatus.READY_FOR_SHIPMENT,
        PackageStatus.SHIPPED,
        PackageStatus.ON_HOLD,
        PackageStatus.DAMAGED,
        // Shipment statuses warehouse admins can set
        ShipmentStatus.PROCESSING,
        ShipmentStatus.SHIPPED,
        ShipmentStatus.ARRIVED
      ],
      'admin': [
        // Admins can set any status
        ...Object.values(PackageStatus),
        ...Object.values(ShipmentStatus)
      ],
      'superadmin': [
        // Superadmins can set any status
        ...Object.values(PackageStatus),
        ...Object.values(ShipmentStatus)
      ]
    };

    const allowedStatuses = rolePermissions[userRole] || [];
    
    if (!allowedStatuses.includes(newStatus)) {
      return {
        isValid: false,
        error: `Role '${userRole}' is not authorized to set status '${newStatus}'`,
        suggestedActions: [`Contact an administrator for status changes to '${newStatus}'`]
      };
    }

    return { isValid: true };
  }

  /**
   * Validate package-specific business rules
   * @param context - The transition context
   * @returns Validation result
   */
  private static validatePackageBusinessRules(context: StatusTransitionContext): WorkflowValidationResult {
    const { currentStatus, newStatus } = context;

    // Special validation for "arrived" status
    if (newStatus === PackageStatus.ARRIVED) {
      if (currentStatus !== PackageStatus.PENDING_ARRIVAL) {
        return {
          isValid: false,
          error: `Packages can only be marked as 'arrived' from 'pending_arrival' status`,
          suggestedActions: ['Verify the package is actually arriving from pending status']
        };
      }
    }

    // Validation for inspection process
    if (newStatus === PackageStatus.INSPECTED) {
      if (currentStatus !== PackageStatus.ARRIVED) {
        return {
          isValid: false,
          error: `Packages must be 'arrived' before they can be 'inspected'`,
          suggestedActions: ['Mark package as arrived first, then proceed with inspection']
        };
      }
    }

    // Validation for customer review process
    if (newStatus === PackageStatus.READY_FOR_REVIEW) {
      if (currentStatus !== PackageStatus.INSPECTED) {
        return {
          isValid: false,
          error: `Packages must be 'inspected' before being ready for customer review`,
          suggestedActions: ['Complete package inspection first']
        };
      }
    }

    // Validation for shipping process
    if (newStatus === PackageStatus.SHIPPED) {
      const validPreShippingStatuses = [
        PackageStatus.READY_FOR_SHIPMENT,
        PackageStatus.CONSOLIDATED
      ];
      
      if (!validPreShippingStatuses.includes(currentStatus as PackageStatusValue)) {
        return {
          isValid: false,
          error: `Packages must be 'ready_for_shipment' or 'consolidated' before shipping`,
          suggestedActions: ['Prepare package for shipment first']
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate shipment-specific business rules
   * @param context - The transition context
   * @returns Validation result
   */
  private static validateShipmentBusinessRules(context: StatusTransitionContext): WorkflowValidationResult {
    const { currentStatus, newStatus } = context;

    // Special validation for "arrived" status in shipments
    if (newStatus === ShipmentStatus.ARRIVED) {
      const validPreArrivalStatuses = [
        ShipmentStatus.SHIPPED,
        ShipmentStatus.IN_TRANSIT
      ];
      
      if (!validPreArrivalStatuses.includes(currentStatus as ShipmentStatusValue)) {
        return {
          isValid: false,
          error: `Shipments can only be marked as 'arrived' from 'shipped' or 'in_transit' status`,
          suggestedActions: ['Verify shipment is actually in transit before marking as arrived']
        };
      }
    }

    // Validation for payment-dependent transitions
    if (newStatus === ShipmentStatus.PROCESSING) {
      if (currentStatus !== ShipmentStatus.PAYMENT_PENDING) {
        return {
          isValid: false,
          error: `Shipments can only be processed after payment is confirmed`,
          suggestedActions: ['Confirm payment before processing shipment']
        };
      }
    }

    // Validation for customs clearance
    if (newStatus === ShipmentStatus.CUSTOMS_CLEARANCE) {
      const validPreCustomsStatuses = [
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.ARRIVED
      ];
      
      if (!validPreCustomsStatuses.includes(currentStatus as ShipmentStatusValue)) {
        return {
          isValid: false,
          error: `Shipments must be 'in_transit' or 'arrived' before customs clearance`,
          suggestedActions: ['Wait for shipment to reach destination country']
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Get suggested actions based on the new status
   * @param newStatus - The new status
   * @param entityType - Type of entity
   * @returns Array of suggested actions
   */
  private static getSuggestedActions(newStatus: string, entityType: 'package' | 'shipment'): string[] {
    const actions: string[] = [];

    if (entityType === 'package') {
      switch (newStatus) {
        case PackageStatus.ARRIVED:
          actions.push('Scan package barcode', 'Verify package condition', 'Update inventory system');
          break;
        case PackageStatus.INSPECTED:
          actions.push('Document package contents', 'Take photos if needed', 'Check for damage');
          break;
        case PackageStatus.READY_FOR_REVIEW:
          actions.push('Notify customer', 'Send inspection photos', 'Wait for customer approval');
          break;
        case PackageStatus.APPROVED:
          actions.push('Prepare for consolidation', 'Update shipping queue');
          break;
        case PackageStatus.SHIPPED:
          actions.push('Generate tracking number', 'Notify customer', 'Update carrier system');
          break;
      }
    } else {
      switch (newStatus) {
        case ShipmentStatus.ARRIVED:
          actions.push('Confirm arrival location', 'Update tracking system', 'Notify next handler');
          break;
        case ShipmentStatus.PROCESSING:
          actions.push('Consolidate packages', 'Calculate final costs', 'Prepare shipping labels');
          break;
        case ShipmentStatus.SHIPPED:
          actions.push('Dispatch to carrier', 'Generate tracking number', 'Send customer notification');
          break;
        case ShipmentStatus.CUSTOMS_CLEARANCE:
          actions.push('Submit customs documentation', 'Pay duties if required', 'Track clearance progress');
          break;
      }
    }

    return actions;
  }

  /**
   * Get workflow automation rules for a status transition
   * @param newStatus - The new status
   * @param entityType - Type of entity
   * @returns Automation rules
   */
  static getAutomationRules(newStatus: string, entityType: 'package' | 'shipment'): WorkflowAutomationRule[] {
    const rules: WorkflowAutomationRule[] = [];

    if (entityType === 'package') {
      switch (newStatus) {
        case PackageStatus.ARRIVED:
          rules.push({
            trigger: 'status_change',
            conditions: { status: PackageStatus.ARRIVED },
            actions: ['update_inventory', 'log_arrival_time'],
            notifications: ['warehouse_team']
          });
          break;
        case PackageStatus.READY_FOR_REVIEW:
          rules.push({
            trigger: 'status_change',
            conditions: { status: PackageStatus.READY_FOR_REVIEW },
            actions: ['send_customer_notification', 'start_review_timer'],
            notifications: ['customer_email', 'customer_whatsapp']
          });
          break;
        case PackageStatus.SHIPPED:
          rules.push({
            trigger: 'status_change',
            conditions: { status: PackageStatus.SHIPPED },
            actions: ['generate_tracking', 'update_carrier_system'],
            notifications: ['customer_email', 'customer_sms', 'customer_whatsapp']
          });
          break;
      }
    } else {
      switch (newStatus) {
        case ShipmentStatus.ARRIVED:
          rules.push({
            trigger: 'status_change',
            conditions: { status: ShipmentStatus.ARRIVED },
            actions: ['update_tracking', 'log_arrival_location'],
            notifications: ['customer_app', 'tracking_system']
          });
          break;
        case ShipmentStatus.DELIVERED:
          rules.push({
            trigger: 'status_change',
            conditions: { status: ShipmentStatus.DELIVERED },
            actions: ['complete_delivery', 'archive_shipment', 'generate_delivery_report'],
            notifications: ['customer_email', 'customer_whatsapp', 'admin_dashboard']
          });
          break;
      }
    }

    return rules;
  }

  /**
   * Check if a status change requires immediate attention
   * @param newStatus - The new status
   * @param entityType - Type of entity
   * @returns Boolean indicating if immediate attention is required
   */
  static requiresImmediateAttention(newStatus: string, entityType: 'package' | 'shipment'): boolean {
    const urgentStatuses = [
      PackageStatus.DAMAGED,
      PackageStatus.LOST,
      PackageStatus.ON_HOLD,
      ShipmentStatus.CANCELLED,
      ShipmentStatus.CUSTOMS_CLEARANCE
    ];

    return urgentStatuses.includes(newStatus);
  }

  /**
   * Get expected completion time for a status
   * @param status - The status
   * @param entityType - Type of entity
   * @returns Expected completion time in hours
   */
  static getExpectedCompletionTime(status: string, entityType: 'package' | 'shipment'): number | null {
    if (entityType === 'package') {
      return PackageStatusUtils.getExpectedDuration(status as PackageStatusValue);
    } else {
      return ShipmentStatusUtils.getExpectedDuration(status as ShipmentStatusValue);
    }
  }

  /**
   * Check if a status is overdue based on expected duration
   * @param status - The current status
   * @param statusChangedAt - When the status was last changed
   * @param entityType - Type of entity
   * @returns Boolean indicating if status is overdue
   */
  static isStatusOverdue(
    status: string,
    statusChangedAt: Date,
    entityType: 'package' | 'shipment'
  ): boolean {
    const expectedDuration = this.getExpectedCompletionTime(status, entityType);
    
    if (!expectedDuration) {
      return false; // Final statuses or indefinite statuses are never overdue
    }

    const now = new Date();
    const hoursSinceChange = (now.getTime() - statusChangedAt.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceChange > expectedDuration;
  }
}

// ============================================================================
// WORKFLOW AUTOMATION UTILITIES
// ============================================================================

/**
 * Workflow automation engine for handling status-based triggers
 */
export class WorkflowAutomationEngine {
  
  /**
   * Execute automation rules for a status transition
   * @param context - The transition context
   * @returns Promise resolving to execution results
   */
  static async executeAutomationRules(context: StatusTransitionContext): Promise<{
    executed: string[];
    failed: string[];
    notifications: string[];
  }> {
    const rules = StatusWorkflowValidator.getAutomationRules(context.newStatus, context.entityType);
    const executed: string[] = [];
    const failed: string[] = [];
    const notifications: string[] = [];

    for (const rule of rules) {
      try {
        // Execute actions
        for (const action of rule.actions) {
          await this.executeAction(action, context);
          executed.push(action);
        }

        // Queue notifications
        notifications.push(...rule.notifications);
      } catch (error) {
        console.error(`Failed to execute automation rule:`, error);
        failed.push(rule.trigger);
      }
    }

    return { executed, failed, notifications };
  }

  /**
   * Execute a specific automation action
   * @param action - The action to execute
   * @param context - The transition context
   */
  private static async executeAction(action: string, context: StatusTransitionContext): Promise<void> {
    switch (action) {
      case 'update_inventory':
        console.log(`Updating inventory for ${context.entityType} ${context.entityId}`);
        // TODO: Implement inventory update
        break;
      case 'send_customer_notification':
        console.log(`Sending customer notification for ${context.entityType} ${context.entityId}`);
        // TODO: Implement customer notification
        break;
      case 'generate_tracking':
        console.log(`Generating tracking for ${context.entityType} ${context.entityId}`);
        // TODO: Implement tracking generation
        break;
      case 'update_tracking':
        console.log(`Updating tracking for ${context.entityType} ${context.entityId}`);
        // TODO: Implement tracking update
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export {
  StatusWorkflowValidator,
  WorkflowAutomationEngine
};

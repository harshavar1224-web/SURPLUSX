import { InventoryBatch, InventoryMovement, InventoryMovementType } from '../types';

/**
 * FEFO (First Expired, First Out) Inventory Batch Manager
 * Guarantees that stock nearing expiration is allocated and listed first,
 * preventing warehouse and retail food waste.
 */

export function sortBatchesByFEFO(batches: InventoryBatch[]): InventoryBatch[] {
  return [...batches].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );
}

export interface BatchAllocationResult {
  allocatedBatches: {
    batchId: string;
    batchNumber: string;
    quantityAllocated: number;
    expiryDate: string;
  }[];
  remainingRequested: number;
  isFullyAllocated: boolean;
  movements: Omit<InventoryMovement, 'id' | 'timestamp'>[];
}

/**
 * Allocates requested quantity across active batches according to FEFO
 */
export function allocateStockFEFO(
  batches: InventoryBatch[],
  quantityRequested: number,
  movementType: InventoryMovementType = 'RESERVATION',
  reason = 'Checkout Reservation hold',
  performedBy = 'system'
): BatchAllocationResult {
  const sorted = sortBatchesByFEFO(batches);
  let needed = quantityRequested;
  const allocations: BatchAllocationResult['allocatedBatches'] = [];
  const movements: BatchAllocationResult['movements'] = [];

  for (const batch of sorted) {
    if (needed <= 0) break;
    if (batch.remainingQty <= 0) continue;

    const alloc = Math.min(batch.remainingQty, needed);
    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      quantityAllocated: alloc,
      expiryDate: batch.expiryDate,
    });

    movements.push({
      inventoryItemId: batch.inventoryItemId,
      batchId: batch.id,
      type: movementType,
      quantity: alloc,
      previousQty: batch.remainingQty,
      newQty: batch.remainingQty - alloc,
      reason,
      performedBy,
    });

    needed -= alloc;
  }

  return {
    allocatedBatches: allocations,
    remainingRequested: needed,
    isFullyAllocated: needed === 0,
    movements,
  };
}

/**
 * Generates an immutable inventory movement record
 */
export function createInventoryMovement(
  inventoryItemId: string,
  type: InventoryMovementType,
  quantity: number,
  previousQty: number,
  newQty: number,
  reason: string,
  performedBy = 'system',
  batchId?: string
): InventoryMovement {
  return {
    id: `mov-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    inventoryItemId,
    batchId,
    type,
    quantity,
    previousQty,
    newQty,
    reason,
    timestamp: new Date().toISOString(),
    performedBy,
  };
}

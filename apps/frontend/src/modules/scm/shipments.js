/**
 * SCM: Shipments & Logistics Tracking View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function ShipmentsView() {
  return EntityView.create({
    entityKey: 'shipment',
    tableName: 'shipments',
    title: 'Outbound & Inbound Logistics Shipments',
    subtitle: 'Carrier tracking, consignment waybills, estimated arrival dates, and transit updates.'
  });
}


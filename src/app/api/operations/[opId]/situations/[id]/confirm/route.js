import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import pool from '@/lib/db';

export const POST = withAuth(async (req, { params, user }) => {
  try {
    const situationId = params.id;

    // Update situation status
    await pool.query(
      `UPDATE situations 
       SET status = 'deposee', date_depot = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [situationId, user.tenant_id]
    );

    // Get situation details for notifications
    const [situations] = await pool.query(
      `SELECT s.*, o.name as operation_name, l.name as lot_name
       FROM situations s
       LEFT JOIN operations o ON s.operation_id = o.id
       LEFT JOIN lots l ON s.lot_id = l.id
       WHERE s.id = ?`,
      [situationId]
    );

    const situation = situations[0];

    // Create notifications for OPC and MOE
    const [opcUsers] = await pool.query(
      `SELECT id FROM users 
       WHERE tenant_id = ? AND role = 'opc'`,
      [user.tenant_id]
    );

    const [moeUsers] = await pool.query(
      `SELECT id FROM users 
       WHERE tenant_id = ? AND role = 'moe'`,
      [user.tenant_id]
    );

    const notificationTitle = `Situation n°${situation.numero} déposée — ${situation.lot_name}`;
    const notificationMessage = `Une nouvelle situation a été déposée pour l'opération ${situation.operation_name}.`;

    for (const opcUser of opcUsers) {
      await pool.query(
        `INSERT INTO notifications (tenant_id, user_id, operation_id, type, title, message, is_popup, priority)
         VALUES (?, ?, ?, 'situation_deposee', ?, ?, TRUE, 'normal')`,
        [user.tenant_id, opcUser.id, situation.operation_id, notificationTitle, notificationMessage]
      );
    }

    for (const moeUser of moeUsers) {
      await pool.query(
        `INSERT INTO notifications (tenant_id, user_id, operation_id, type, title, message, is_popup, priority)
         VALUES (?, ?, ?, 'situation_deposee', ?, ?, TRUE, 'normal')`,
        [user.tenant_id, moeUser.id, situation.operation_id, notificationTitle, notificationMessage]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error confirming situation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

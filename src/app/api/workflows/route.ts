import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/workflows
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nodes, edges } = body;

    // TODO: Aici ar trebui să verificăm dacă user-ul este logat,
    // dar pentru teste, vom folosi/crea un User de test (ID: 1).
    let testUser = await prisma.user.findFirst({ where: { email: 'test@cyberzap.com' } });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: { name: 'Test User', email: 'test@cyberzap.com' }
      });
    }

    // Convertim structura de noduri si muchii intr-un string JSON
    const canvasData = JSON.stringify({ nodes, edges });

    // Salvăm Workflow-ul în baza de date folosind modelul hibrid
    const newWorkflow = await prisma.workflow.create({
      data: {
        name: name || 'Untitled Zap',
        canvasData: canvasData,
        userId: testUser.id
      }
    });

    return NextResponse.json(
      { message: 'Flux salvat cu succes!', workflow: newWorkflow },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'A apărut o eroare la salvare', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    let testUser = await prisma.user.findFirst({ where: { email: 'test@cyberzap.com' } });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: { name: 'Test User', email: 'test@cyberzap.com' }
      });
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(workflows);
  } catch (error: any) {
    console.error('Eroare GET /api/workflows:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare la preluarea fluxurilor', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.workflow.delete({ where: { id } });
    return NextResponse.json({ message: 'Flux șters cu succes!' });
  } catch (error: any) {
    console.error('Eroare DELETE /api/workflows:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare la ștergerea fluxului', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, nodes, edges } = await request.json();
    await prisma.workflow.update({
      where: { id },
      data: { name, canvasData: JSON.stringify({ nodes, edges }) }
    });
    return NextResponse.json({ message: 'Flux actualizat cu succes!' });
  } catch (error: any) {
    console.error('Eroare PUT /api/workflows:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare la actualizarea fluxului', details: error.message },
      { status: 500 }
    );
  }
}


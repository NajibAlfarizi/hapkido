import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function getFinancialSummary(req: AuthRequest, res: Response) {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: { in: ['LUNAS', 'SEBAGIAN'] } },
    });

    const totalIncome = payments.reduce((acc, curr) => acc + curr.paidAmount, 0);

    const expenses = await prisma.expense.findMany();
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // Monthly breakdown for charts
    const monthlyIncome: { [key: string]: number } = {};
    const monthlyExpense: { [key: string]: number } = {};

    payments.forEach((p) => {
      const monthYear = new Date(p.paymentDate).toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + p.paidAmount;
    });

    expenses.forEach((e) => {
      const monthYear = new Date(e.expenseDate).toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      monthlyExpense[monthYear] = (monthlyExpense[monthYear] || 0) + e.amount;
    });

    const allMonths = Array.from(new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpense)]));

    const chartData = allMonths.map((m) => ({
      month: m,
      pemasukan: monthlyIncome[m] || 0,
      pengeluaran: monthlyExpense[m] || 0,
    }));

    return res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        chartData,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

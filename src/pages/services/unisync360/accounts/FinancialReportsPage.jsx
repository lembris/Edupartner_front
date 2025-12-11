import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, TabContent, TabPane, Row, Col, Button, Spinner, Table, Input, Label } from "reactstrap";
import Swal from "sweetalert2";
import { getFinancialReports, exportFinancialReport } from "./Queries";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const MetricCard = ({ title, value, icon, color = "primary", subtitle }) => (
    <Col sm={6} lg={3} className="mb-4">
        <Card className="h-100">
            <CardBody>
                <div className="d-flex align-items-center">
                    <div className="avatar flex-shrink-0">
                        <div className={`bg-${color} rounded p-2`}>
                            <i className={`bx ${icon} text-white`}></i>
                        </div>
                    </div>
                    <div className="ms-3">
                        <span className="fw-medium d-block mb-1">{title}</span>
                        <h3 className={`card-title mb-0 text-${color}`}>{value}</h3>
                        {subtitle && <small className="text-muted d-block">{subtitle}</small>}
                    </div>
                </div>
            </CardBody>
        </Card>
    </Col>
);

export const FinancialReportsPage = () => {
    const [activeTab, setActiveTab] = useState("income_statement");
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    
    const [dateRange, setDateRange] = useState({
        start_date: firstDayOfYear.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0]
    });

    const tabs = [
        { id: "income_statement", label: "Income Statement", icon: "bx-trending-up" },
        { id: "balance_sheet", label: "Balance Sheet", icon: "bx-wallet" },
        { id: "accounts_receivable", label: "Accounts Receivable", icon: "bx-money" },
        { id: "payment_history", label: "Payment History", icon: "bx-history" }
    ];

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getFinancialReports(activeTab, dateRange);
            setReportData(data);
        } catch (err) {
            console.error("Error fetching report:", err);
            setError(err.message || "Failed to load report data");
            Swal.fire({
                icon: 'error',
                title: 'Report Error',
                text: 'Failed to load report data. Please try again.',
                confirmButtonText: 'Retry',
                showCancelButton: true
            }).then((result) => {
                if (result.isConfirmed) fetchReportData();
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [activeTab, dateRange]);

    const handleExport = async (format = 'csv') => {
        try {
            setExporting(true);
            const blob = await exportFinancialReport(activeTab, { ...dateRange, format });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${activeTab}_${dateRange.start_date}_${dateRange.end_date}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            Swal.fire({
                icon: 'success',
                title: 'Export Complete',
                text: 'Report has been downloaded successfully.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Failed to export report. Please try again.'
            });
        } finally {
            setExporting(false);
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setReportData(null);
    };

    const renderIncomeStatement = () => {
        const data = reportData || {};
        const { summary = {}, revenue_items = [], expense_items = [] } = data;

        return (
            <>
                <Row>
                    <MetricCard
                        title="Total Revenue"
                        value={formatCurrency(summary.total_revenue)}
                        icon="bx-dollar-circle"
                        color="success"
                        subtitle="Gross income"
                    />
                    <MetricCard
                        title="Total Expenses"
                        value={formatCurrency(summary.total_expenses)}
                        icon="bx-receipt"
                        color="danger"
                        subtitle="Operating costs"
                    />
                    <MetricCard
                        title="Net Income"
                        value={formatCurrency(summary.net_income)}
                        icon="bx-trending-up"
                        color={summary.net_income >= 0 ? "primary" : "warning"}
                        subtitle="Profit/Loss"
                    />
                    <MetricCard
                        title="Profit Margin"
                        value={`${summary.profit_margin || 0}%`}
                        icon="bx-pie-chart-alt"
                        color="info"
                        subtitle="Net margin"
                    />
                </Row>

                <Row>
                    <Col lg={6} className="mb-4">
                        <Card className="h-100">
                            <CardHeader className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Revenue</h5>
                                <span className="badge bg-success">{formatCurrency(summary.total_revenue)}</span>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Category</th>
                                            <th className="text-end">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenue_items.length > 0 ? (
                                            revenue_items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.category || item.description}</td>
                                                    <td className="text-end text-success">{formatCurrency(item.amount)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="text-center text-muted py-4">No revenue data</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col lg={6} className="mb-4">
                        <Card className="h-100">
                            <CardHeader className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Expenses</h5>
                                <span className="badge bg-danger">{formatCurrency(summary.total_expenses)}</span>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Category</th>
                                            <th className="text-end">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expense_items.length > 0 ? (
                                            expense_items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.category || item.description}</td>
                                                    <td className="text-end text-danger">{formatCurrency(item.amount)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="text-center text-muted py-4">No expense data</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };

    const renderBalanceSheet = () => {
        const data = reportData || {};
        const { summary = {}, assets = [], liabilities = [], equity = [] } = data;

        return (
            <>
                <Row>
                    <MetricCard
                        title="Total Assets"
                        value={formatCurrency(summary.total_assets)}
                        icon="bx-building-house"
                        color="primary"
                        subtitle="What we own"
                    />
                    <MetricCard
                        title="Total Liabilities"
                        value={formatCurrency(summary.total_liabilities)}
                        icon="bx-credit-card"
                        color="danger"
                        subtitle="What we owe"
                    />
                    <MetricCard
                        title="Total Equity"
                        value={formatCurrency(summary.total_equity)}
                        icon="bx-wallet-alt"
                        color="success"
                        subtitle="Net worth"
                    />
                    <MetricCard
                        title="Debt Ratio"
                        value={`${summary.debt_ratio || 0}%`}
                        icon="bx-bar-chart"
                        color="info"
                        subtitle="Liabilities/Assets"
                    />
                </Row>

                <Row>
                    <Col lg={4} className="mb-4">
                        <Card className="h-100">
                            <CardHeader className="bg-primary text-white">
                                <h5 className="mb-0">Assets</h5>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Item</th>
                                            <th className="text-end">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assets.length > 0 ? (
                                            assets.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.name || item.account}</td>
                                                    <td className="text-end">{formatCurrency(item.value || item.balance)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={2} className="text-center text-muted py-4">No assets</td></tr>
                                        )}
                                        <tr className="table-primary fw-bold">
                                            <td>Total</td>
                                            <td className="text-end">{formatCurrency(summary.total_assets)}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col lg={4} className="mb-4">
                        <Card className="h-100">
                            <CardHeader className="bg-danger text-white">
                                <h5 className="mb-0">Liabilities</h5>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Item</th>
                                            <th className="text-end">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {liabilities.length > 0 ? (
                                            liabilities.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.name || item.account}</td>
                                                    <td className="text-end">{formatCurrency(item.value || item.balance)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={2} className="text-center text-muted py-4">No liabilities</td></tr>
                                        )}
                                        <tr className="table-danger fw-bold">
                                            <td>Total</td>
                                            <td className="text-end">{formatCurrency(summary.total_liabilities)}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col lg={4} className="mb-4">
                        <Card className="h-100">
                            <CardHeader className="bg-success text-white">
                                <h5 className="mb-0">Equity</h5>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Item</th>
                                            <th className="text-end">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {equity.length > 0 ? (
                                            equity.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.name || item.account}</td>
                                                    <td className="text-end">{formatCurrency(item.value || item.balance)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={2} className="text-center text-muted py-4">No equity</td></tr>
                                        )}
                                        <tr className="table-success fw-bold">
                                            <td>Total</td>
                                            <td className="text-end">{formatCurrency(summary.total_equity)}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };

    const renderAccountsReceivable = () => {
        const data = reportData || {};
        const { summary = {}, receivables = [] } = data;

        return (
            <>
                <Row>
                    <MetricCard
                        title="Total Receivable"
                        value={formatCurrency(summary.total_receivable)}
                        icon="bx-dollar"
                        color="primary"
                        subtitle="Outstanding amount"
                    />
                    <MetricCard
                        title="Overdue Amount"
                        value={formatCurrency(summary.overdue_amount)}
                        icon="bx-error-circle"
                        color="danger"
                        subtitle="Past due date"
                    />
                    <MetricCard
                        title="Pending Invoices"
                        value={summary.pending_invoices || 0}
                        icon="bx-file"
                        color="warning"
                        subtitle="Awaiting payment"
                    />
                    <MetricCard
                        title="Collection Rate"
                        value={`${summary.collection_rate || 0}%`}
                        icon="bx-check-circle"
                        color="success"
                        subtitle="Payment success"
                    />
                </Row>

                <Row>
                    <Col xs={12}>
                        <Card>
                            <CardHeader className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Outstanding Receivables</h5>
                                <span className="badge bg-primary">{receivables.length} Records</span>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Student/Client</th>
                                            <th>Invoice #</th>
                                            <th>Issue Date</th>
                                            <th>Due Date</th>
                                            <th className="text-end">Amount</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receivables.length > 0 ? (
                                            receivables.map((item, index) => {
                                                const isOverdue = new Date(item.due_date) < new Date() && item.status !== 'paid';
                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="fw-medium">{item.client_name || item.student_name}</div>
                                                            <small className="text-muted">{item.email}</small>
                                                        </td>
                                                        <td>{item.invoice_number}</td>
                                                        <td>{formatDate(item.issue_date)}</td>
                                                        <td>
                                                            <span className={isOverdue ? 'text-danger fw-medium' : ''}>
                                                                {formatDate(item.due_date)}
                                                            </span>
                                                        </td>
                                                        <td className="text-end fw-medium">{formatCurrency(item.amount)}</td>
                                                        <td className="text-center">
                                                            <span className={`badge bg-${
                                                                item.status === 'paid' ? 'success' :
                                                                item.status === 'overdue' || isOverdue ? 'danger' :
                                                                item.status === 'partial' ? 'warning' : 'info'
                                                            }`}>
                                                                {item.status || (isOverdue ? 'Overdue' : 'Pending')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center text-muted py-4">
                                                    <i className="bx bx-check-circle display-6 d-block mb-2"></i>
                                                    No outstanding receivables
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };

    const renderPaymentHistory = () => {
        const data = reportData || {};
        const { summary = {}, payments = [] } = data;

        return (
            <>
                <Row>
                    <MetricCard
                        title="Total Collected"
                        value={formatCurrency(summary.total_collected)}
                        icon="bx-check-circle"
                        color="success"
                        subtitle="Total payments received"
                    />
                    <MetricCard
                        title="This Month"
                        value={formatCurrency(summary.current_month)}
                        icon="bx-calendar"
                        color="primary"
                        subtitle="Monthly collection"
                    />
                    <MetricCard
                        title="Total Transactions"
                        value={summary.total_transactions || payments.length}
                        icon="bx-transfer"
                        color="info"
                        subtitle="Payment count"
                    />
                    <MetricCard
                        title="Avg. Payment"
                        value={formatCurrency(summary.average_payment)}
                        icon="bx-calculator"
                        color="warning"
                        subtitle="Per transaction"
                    />
                </Row>

                <Row>
                    <Col xs={12}>
                        <Card>
                            <CardHeader className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Payment Transactions</h5>
                                <span className="badge bg-success">{payments.length} Payments</span>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Student/Client</th>
                                            <th>Reference</th>
                                            <th>Method</th>
                                            <th className="text-end">Amount</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.length > 0 ? (
                                            payments.map((payment, index) => (
                                                <tr key={index}>
                                                    <td>{formatDate(payment.payment_date || payment.date)}</td>
                                                    <td>
                                                        <div className="fw-medium">{payment.client_name || payment.student_name}</div>
                                                        <small className="text-muted">{payment.invoice_number}</small>
                                                    </td>
                                                    <td>{payment.reference || payment.transaction_id || '-'}</td>
                                                    <td>
                                                        <span className="badge bg-label-secondary">
                                                            <i className={`bx ${
                                                                payment.method === 'card' ? 'bx-credit-card' :
                                                                payment.method === 'bank' ? 'bx-building' :
                                                                payment.method === 'cash' ? 'bx-money' : 'bx-wallet'
                                                            } me-1`}></i>
                                                            {payment.method || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="text-end fw-medium text-success">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`badge bg-${
                                                            payment.status === 'completed' || payment.status === 'success' ? 'success' :
                                                            payment.status === 'pending' ? 'warning' :
                                                            payment.status === 'failed' ? 'danger' : 'info'
                                                        }`}>
                                                            {payment.status || 'Completed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center text-muted py-4">
                                                    <i className="bx bx-receipt display-6 d-block mb-2"></i>
                                                    No payment records found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="text-center">
                        <Spinner color="primary" />
                        <p className="mt-2 text-muted">Loading report data...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="bx bx-error-circle me-2 fs-4"></i>
                        <div>
                            <h6 className="alert-heading mb-1">Failed to load report</h6>
                            <p className="mb-0">{error}</p>
                        </div>
                    </div>
                    <Button color="outline-danger" size="sm" className="mt-2" onClick={fetchReportData}>
                        <i className="bx bx-refresh me-1"></i> Retry
                    </Button>
                </div>
            );
        }

        switch (activeTab) {
            case 'income_statement':
                return renderIncomeStatement();
            case 'balance_sheet':
                return renderBalanceSheet();
            case 'accounts_receivable':
                return renderAccountsReceivable();
            case 'payment_history':
                return renderPaymentHistory();
            default:
                return null;
        }
    };

    return (
        <div className="container-fluid">
            <Row className="mb-4">
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                                <div>
                                    <h4 className="mb-1">Financial Reports</h4>
                                    <p className="text-muted mb-0">View and analyze financial data</p>
                                </div>
                                <div className="d-flex flex-wrap align-items-center gap-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <Label className="mb-0" for="startDate">From:</Label>
                                        <Input
                                            type="date"
                                            id="startDate"
                                            value={dateRange.start_date}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                                            style={{ width: 'auto' }}
                                        />
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Label className="mb-0" for="endDate">To:</Label>
                                        <Input
                                            type="date"
                                            id="endDate"
                                            value={dateRange.end_date}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                                            style={{ width: 'auto' }}
                                        />
                                    </div>
                                    <Button
                                        color="outline-primary"
                                        size="sm"
                                        onClick={() => handleExport('csv')}
                                        disabled={exporting || loading}
                                    >
                                        {exporting ? (
                                            <><Spinner size="sm" className="me-1" /> Exporting...</>
                                        ) : (
                                            <><i className="bx bx-download me-1"></i> Export CSV</>
                                        )}
                                    </Button>
                                    <Button
                                        color="outline-secondary"
                                        size="sm"
                                        onClick={fetchReportData}
                                        disabled={loading}
                                    >
                                        <i className="bx bx-refresh me-1"></i> Refresh
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col xs={12}>
                    <Card>
                        <CardBody className="pb-0">
                            <Nav tabs className="nav-tabs-custom">
                                {tabs.map((tab) => (
                                    <NavItem key={tab.id}>
                                        <NavLink
                                            className={activeTab === tab.id ? 'active' : ''}
                                            onClick={() => handleTabChange(tab.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <i className={`bx ${tab.icon} me-1`}></i>
                                            {tab.label}
                                        </NavLink>
                                    </NavItem>
                                ))}
                            </Nav>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <TabContent activeTab={activeTab}>
                <TabPane tabId={activeTab}>
                    {renderTabContent()}
                </TabPane>
            </TabContent>
        </div>
    );
};

export default FinancialReportsPage;

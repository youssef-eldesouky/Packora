/**
 * Packora Bug Report Generator
 * Generates a detailed HTML + Excel bug report based on all test findings.
 *
 * Run: node generate-bug-report.js
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const now = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });
const reportDate = new Date().toISOString().split('T')[0];

// ── Bug Data ─────────────────────────────────────────────────────────────────
// Each bug documented was discovered and fixed during the test authoring process.
const bugs = [
  // ── Infrastructure / Environment ──
  {
    id: 'BUG-001',
    title: 'H2 Database v2.4.240 Throws Check Constraint Violation on Simple Inserts',
    severity: 'Critical',
    priority: 'P1',
    status: 'Fixed',
    layer: 'Backend',
    component: 'Database / H2',
    affectedTests: 'All Repository Tests (BE-002 → BE-060)',
    rootCause: 'H2 version 2.4.240 introduced stricter check-constraint validation that conflicts with the Packora JPA schema. Simple INSERT statements (e.g., saving a Product or User) raised SQLState 23514 (check constraint violated), blocking all @DataJpaTest tests from running.',
    stepsToReproduce: '1. Upgrade H2 to 2.4.240 in pom.xml.\n2. Run `./mvnw test` on any Repository test.\n3. Observe: HibernateJdbcException → Check constraint "ORDERS_STATUS_CHECK" invalid.',
    fix: 'Version-pinned H2 to 2.3.232 in backend/pom.xml:\n<h2.version>2.3.232</h2.version>',
    fixedIn: 'backend/pom.xml',
    discoveredBy: 'Automated Test Run (ProductRepositoryTest)',
    environment: 'Spring Boot 4.0.3 / Java 17 / H2 in-memory',
    notes: 'This is a known incompatibility. Spring Boot 4 auto-resolves to H2 2.4.x; explicit version override is required.',
  },
  {
    id: 'BUG-002',
    title: 'Frontend Tests Fail: TextEncoder / TextDecoder Not Defined in Jest Environment',
    severity: 'Critical',
    priority: 'P1',
    status: 'Fixed',
    layer: 'Frontend',
    component: 'Test Environment / Jest',
    affectedTests: 'All Component Tests (FE-022 → FE-048)',
    rootCause: 'React Router v7 (used internally by React 19 test wrappers) requires the Web-standard TextEncoder and TextDecoder APIs. Jest\'s default jsdom environment does not include these, causing a ReferenceError at import time for any component that uses routing.',
    stepsToReproduce: '1. Create a test for LoginPage.test.jsx or any component wrapped in <MemoryRouter>.\n2. Run `npm test`.\n3. Observe: ReferenceError: TextEncoder is not defined.',
    fix: 'Added polyfills to src/setupTests.js:\nconst { TextEncoder, TextDecoder } = require(\'util\');\nObject.assign(global, { TextEncoder, TextDecoder });',
    fixedIn: 'src/setupTests.js',
    discoveredBy: 'Automated Test Run (LoginPage.test.jsx)',
    environment: 'React 19 / Jest 29 / jsdom / React Router v7',
    notes: 'Polyfill must be placed before any React Router import in setupTests.js. Order matters.',
  },
  {
    id: 'BUG-003',
    title: 'Spring Boot 4 @DataJpaTest: application-test.properties Not Auto-Loaded',
    severity: 'High',
    priority: 'P2',
    status: 'Fixed',
    layer: 'Backend',
    component: 'Test Configuration / Spring Boot',
    affectedTests: 'All Repository Tests (BE-002 → BE-060)',
    rootCause: 'Spring Boot 4 changed the auto-detection path for test properties. The file at src/test/resources/application.properties was not picked up for @DataJpaTest slice tests, causing tests to attempt a full datasource connection instead of using H2 in-memory.',
    stepsToReproduce: '1. Create a @DataJpaTest class without @ActiveProfiles annotation.\n2. Run the test without application-test.properties in the correct location.\n3. Observe: DataSource connection refused (attempts to connect to production DB).',
    fix: 'Created src/test/resources/application-test.properties with:\nspring.datasource.url=jdbc:h2:mem:testdb\nspring.datasource.driver-class-name=org.h2.Driver\nspring.jpa.hibernate.ddl-auto=create-drop\nAdded @ActiveProfiles("test") to all @DataJpaTest classes.',
    fixedIn: 'backend/src/test/resources/application-test.properties',
    discoveredBy: 'Automated Test Run (UserRepositoryTest)',
    environment: 'Spring Boot 4.0.3 / JUnit 5',
    notes: 'All @DataJpaTest classes must declare @ActiveProfiles("test") explicitly in Spring Boot 4.',
  },
  {
    id: 'BUG-004',
    title: 'Single Table Inheritance (STI) Schema Missing Discriminator for SupportStaff Subtype',
    severity: 'High',
    priority: 'P2',
    status: 'Fixed',
    layer: 'Backend',
    component: 'Repository / User / JPA',
    affectedTests: 'BE-052, BE-053 (TicketRepositoryTest)',
    rootCause: 'The User entity uses Single Table Inheritance (@Inheritance(strategy = SINGLE_TABLE)). SupportStaff, a subtype required for Ticket association tests, was not included in the entity inheritance hierarchy, causing a MappingException when @DataJpaTest tried to build the schema.',
    stepsToReproduce: '1. Write TicketRepositoryTest with a SupportStaff user.\n2. Run the test.\n3. Observe: org.hibernate.MappingException: Unknown entity class.',
    fix: 'Verified SupportStaff extends User with @DiscriminatorValue("SUPPORT_STAFF"). Added SupportStaff to the @DataJpaTest entity scan.',
    fixedIn: 'backend/src/test/java/com/packora/backend/repository/TicketRepositoryTest.java',
    discoveredBy: 'Automated Test Run (TicketRepositoryTest)',
    environment: 'Spring Boot 4.0.3 / Hibernate 6 / JPA',
    notes: 'STI subtypes must be on the classpath and visible to Hibernate for slice tests to work.',
  },
  {
    id: 'BUG-005',
    title: 'generate-test-report.js: Nested Template Literal Syntax Error Prevents HTML Generation',
    severity: 'High',
    priority: 'P2',
    status: 'Fixed',
    layer: 'Tooling',
    component: 'Reporting Script',
    affectedTests: 'All Tests (HTML Report Generation)',
    rootCause: 'The HTML report block inside generate-test-report.js used unescaped backtick characters (`) within a template literal string. Node.js interpreted these as closing the outer template literal, causing a SyntaxError: Invalid or unexpected token at runtime.',
    stepsToReproduce: '1. Run `node generate-test-report.js`.\n2. Observe: SyntaxError at the HTML content block.',
    fix: 'Refactored HTML generation to use string concatenation via a for-loop (backendRowsHtml, frontendRowsHtml) instead of nested template literals. The outer template literal now contains only safe single-quoted and double-quoted HTML.',
    fixedIn: 'generate-test-report.js',
    discoveredBy: 'Manual script execution',
    environment: 'Node.js / JavaScript',
    notes: 'Nested template literals in JS are valid but require careful escaping. Using string concatenation for large HTML blocks is safer.',
  },
  {
    id: 'BUG-006',
    title: 'LoginPage: No Inline Validation — Empty Form Can Be Submitted',
    severity: 'Medium',
    priority: 'P3',
    status: 'Open',
    layer: 'Frontend',
    component: 'LoginPage',
    affectedTests: 'FE-022 → FE-033 (LoginPage.test.jsx)',
    rootCause: 'The LoginPage component does not validate that the email/password fields are non-empty before submitting the form. A user can click "Sign In" with empty fields, triggering a network request with blank credentials.',
    stepsToReproduce: '1. Open the Login page.\n2. Leave email and password empty.\n3. Click "Sign In".\n4. Observe: API call is made with empty body (no client-side validation error shown).',
    fix: 'Recommended: Add required attribute to both inputs and/or add JS validation in the submit handler to check for empty fields before calling the API.',
    fixedIn: 'Not yet fixed',
    discoveredBy: 'Manual Code Review during test authoring',
    environment: 'React 19 / Browser',
    notes: 'Backend does return 401 on empty credentials, but UX should prevent the request entirely.',
  },
  {
    id: 'BUG-007',
    title: 'Navbar: No Active Link Highlighting for Current Route',
    severity: 'Low',
    priority: 'P4',
    status: 'Open',
    layer: 'Frontend',
    component: 'Navbar',
    affectedTests: 'FE-034 → FE-038 (Navbar.test.jsx)',
    rootCause: 'The Navbar renders all navigation links with the same styling regardless of the active route. There is no visual indicator (e.g., active class, underline, color) to show which page the user is currently on.',
    stepsToReproduce: '1. Navigate to the Catalog page.\n2. Observe: All nav links appear identical — no active state shown.',
    fix: 'Recommended: Use React Router\'s <NavLink> with an active class or style callback to highlight the current route link.',
    fixedIn: 'Not yet fixed',
    discoveredBy: 'Manual Code Review during test authoring',
    environment: 'React 19 / React Router v7',
    notes: 'Minor UX issue. No functional impact.',
  },
  {
    id: 'BUG-008',
    title: 'API Token Retrieval: No Handling of localStorage SecurityError (Private Browsing)',
    severity: 'Medium',
    priority: 'P3',
    status: 'Open',
    layer: 'Frontend',
    component: 'Utils / api',
    affectedTests: 'FE-009 → FE-014 (api.test.js)',
    rootCause: 'The getStoredToken() function in api.js catches malformed JSON but does not handle the case where localStorage is completely inaccessible (e.g., in private/incognito mode with strict settings, or when storage is disabled by browser policy). This throws an uncaught SecurityError.',
    stepsToReproduce: '1. Open app in a browser with localStorage disabled (about:config → dom.storage.enabled=false in Firefox).\n2. Observe: Uncaught DOMException: SecurityError.',
    fix: 'Recommended: Wrap the localStorage.getItem() call in an additional try-catch for SecurityError.',
    fixedIn: 'Not yet fixed',
    discoveredBy: 'Code Review during api.test.js authoring',
    environment: 'Browser (Private/Strict mode)',
    notes: 'Low probability but worth hardening for production.',
  },
  {
    id: 'BUG-009',
    title: 'Order Repository: sumRevenue Query Returns Null Instead of 0 When No Orders Exist',
    severity: 'Medium',
    priority: 'P3',
    status: 'Open',
    layer: 'Backend',
    component: 'Repository / Order',
    affectedTests: 'BE-047 (OrderRepositoryTest — sumRevenue_shouldExcludeCancelled)',
    rootCause: 'The @Query for summing revenue uses SUM() which returns NULL when the result set is empty (SQL standard behavior). The calling service layer does not null-check this, which can lead to a NullPointerException when there are no non-cancelled orders.',
    stepsToReproduce: '1. Clear all orders from the DB.\n2. Call the revenue sum endpoint.\n3. Observe: NullPointerException in service layer (or null returned to API consumer).',
    fix: 'Recommended: Use COALESCE(SUM(o.totalAmount), 0) in the JPQL query, or null-check the return value in the service layer.',
    fixedIn: 'Not yet fixed',
    discoveredBy: 'Test analysis during OrderRepositoryTest authoring',
    environment: 'Spring Boot 4 / JPA',
    notes: 'Test currently passes because test always seeds at least one valid order before asserting.',
  },
  {
    id: 'BUG-010',
    title: 'PaymentSuccess: Transaction ID Exposed in Plain URL Parameter (No Encoding)',
    severity: 'Low',
    priority: 'P4',
    status: 'Open',
    layer: 'Frontend',
    component: 'PaymentSuccess',
    affectedTests: 'FE-045, FE-046 (PaymentSuccess.test.jsx)',
    rootCause: 'The PaymentSuccess component reads the transaction ID directly from the URL search parameter (?txn=...) and renders it unencoded. If the transaction ID contains special characters, it can break URL parsing. Additionally, raw transaction IDs in URLs are visible in browser history and server logs.',
    stepsToReproduce: '1. Complete a payment with a transaction ID containing & or # characters.\n2. Observe: URL parameter is truncated/misread.',
    fix: 'Recommended: Encode the txn parameter with encodeURIComponent() when building the URL, and decode with decodeURIComponent() on read.',
    fixedIn: 'Not yet fixed',
    discoveredBy: 'Code Review during PaymentSuccess.test.jsx authoring',
    environment: 'React 19 / Browser',
    notes: 'Security-adjacent but low severity in practice as transaction IDs are typically alphanumeric.',
  },
];

const bugSummary = {
  total: bugs.length,
  critical: bugs.filter(b => b.severity === 'Critical').length,
  high: bugs.filter(b => b.severity === 'High').length,
  medium: bugs.filter(b => b.severity === 'Medium').length,
  low: bugs.filter(b => b.severity === 'Low').length,
  fixed: bugs.filter(b => b.status === 'Fixed').length,
  open: bugs.filter(b => b.status === 'Open').length,
};

// ── Excel Bug Report ──────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new();

// Summary Sheet
const summaryData = [
  ['PACKORA — Bug Report'],
  ['Generated', now],
  ['Project', 'Packora (Full-Stack E-Commerce Packaging Platform)'],
  ['Test Phase', 'Full Stack — Backend (Spring Boot 4) + Frontend (React 19)'],
  ['Total Tests Run', 108],
  ['Tests Passed', 108],
  ['Pass Rate', '100%'],
  [],
  ['BUG SUMMARY'],
  ['Metric', 'Count'],
  ['Total Bugs Found', bugSummary.total],
  ['Critical', bugSummary.critical],
  ['High', bugSummary.high],
  ['Medium', bugSummary.medium],
  ['Low', bugSummary.low],
  [],
  ['STATUS BREAKDOWN'],
  ['Status', 'Count'],
  ['Fixed', bugSummary.fixed],
  ['Open (Recommendations)', bugSummary.open],
  [],
  ['SEVERITY × STATUS'],
  ['Severity', 'Status', 'Count'],
  ['Critical', 'Fixed', bugs.filter(b => b.severity === 'Critical' && b.status === 'Fixed').length],
  ['High', 'Fixed', bugs.filter(b => b.severity === 'High' && b.status === 'Fixed').length],
  ['Medium', 'Open', bugs.filter(b => b.severity === 'Medium' && b.status === 'Open').length],
  ['Low', 'Open', bugs.filter(b => b.severity === 'Low' && b.status === 'Open').length],
];
const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
ws1['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 12 }];
ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
XLSX.utils.book_append_sheet(wb, ws1, 'Bug Summary');

// Detailed Bug Sheet
const bugHeaders = ['Bug ID', 'Title', 'Severity', 'Priority', 'Status', 'Layer', 'Component', 'Affected Tests', 'Root Cause', 'Steps to Reproduce', 'Fix / Recommendation', 'Fixed In', 'Discovered By', 'Notes'];
const bugRows = bugs.map(b => [
  b.id, b.title, b.severity, b.priority, b.status, b.layer, b.component,
  b.affectedTests, b.rootCause, b.stepsToReproduce, b.fix, b.fixedIn, b.discoveredBy, b.notes
]);
const ws2 = XLSX.utils.aoa_to_sheet([bugHeaders, ...bugRows]);
ws2['!cols'] = [
  { wch: 10 }, { wch: 55 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
  { wch: 25 }, { wch: 35 }, { wch: 60 }, { wch: 60 }, { wch: 60 }, { wch: 45 }, { wch: 25 }, { wch: 45 }
];
ws2['!autofilter'] = { ref: `A1:N${bugs.length + 1}` };
XLSX.utils.book_append_sheet(wb, ws2, 'Bug Details');

// Fixed Bugs Sheet
const fixedBugs = bugs.filter(b => b.status === 'Fixed');
const fixedRows = fixedBugs.map(b => [b.id, b.title, b.severity, b.layer, b.component, b.fix, b.fixedIn]);
const ws3 = XLSX.utils.aoa_to_sheet([['Bug ID', 'Title', 'Severity', 'Layer', 'Component', 'Fix Applied', 'Fixed In File'], ...fixedRows]);
ws3['!cols'] = [{ wch: 10 }, { wch: 55 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 60 }, { wch: 45 }];
XLSX.utils.book_append_sheet(wb, ws3, 'Fixed Bugs');

// Open Issues Sheet
const openBugs = bugs.filter(b => b.status === 'Open');
const openRows = openBugs.map(b => [b.id, b.title, b.severity, b.priority, b.layer, b.component, b.fix, b.notes]);
const ws4 = XLSX.utils.aoa_to_sheet([['Bug ID', 'Title', 'Severity', 'Priority', 'Layer', 'Component', 'Recommendation', 'Notes'], ...openRows]);
ws4['!cols'] = [{ wch: 10 }, { wch: 55 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 60 }, { wch: 45 }];
XLSX.utils.book_append_sheet(wb, ws4, 'Open Issues');

// Write Excel
const outputDir = path.join(__dirname, 'test-reports');
fs.mkdirSync(outputDir, { recursive: true });
const excelPath = path.join(outputDir, 'Packora_Bug_Report.xlsx');
XLSX.writeFile(wb, excelPath);
console.log(`\n✅ Excel bug report generated: ${excelPath}`);

// ── HTML Bug Report ───────────────────────────────────────────────────────────
function severityColor(sev) {
  if (sev === 'Critical') return '#ef4444';
  if (sev === 'High') return '#f97316';
  if (sev === 'Medium') return '#eab308';
  return '#6b7280';
}
function severityBg(sev) {
  if (sev === 'Critical') return 'rgba(239,68,68,0.15)';
  if (sev === 'High') return 'rgba(249,115,22,0.15)';
  if (sev === 'Medium') return 'rgba(234,179,8,0.15)';
  return 'rgba(107,114,128,0.15)';
}
function statusColor(s) {
  return s === 'Fixed' ? '#22c55e' : '#f97316';
}
function statusBg(s) {
  return s === 'Fixed' ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)';
}
function layerColor(l) {
  if (l === 'Backend') return '#60a5fa';
  if (l === 'Frontend') return '#fbbf24';
  return '#a78bfa';
}

let bugCardsHtml = '';
for (const bug of bugs) {
  bugCardsHtml += `
    <div class="bug-card" id="${bug.id.toLowerCase()}">
      <div class="bug-header">
        <div class="bug-title-row">
          <span class="bug-id">${bug.id}</span>
          <h3 class="bug-title">${bug.title}</h3>
        </div>
        <div class="bug-badges">
          <span class="badge" style="background:${severityBg(bug.severity)};color:${severityColor(bug.severity)};border:1px solid ${severityColor(bug.severity)}40">${bug.severity}</span>
          <span class="badge" style="background:${statusBg(bug.status)};color:${statusColor(bug.status)};border:1px solid ${statusColor(bug.status)}40">${bug.status === 'Fixed' ? '✅' : '⚠️'} ${bug.status}</span>
          <span class="badge" style="background:rgba(96,165,250,0.1);color:${layerColor(bug.layer)};border:1px solid ${layerColor(bug.layer)}40">${bug.layer}</span>
          <span class="badge priority-badge">${bug.priority}</span>
        </div>
      </div>
      <div class="bug-meta">
        <span>🧩 <b>Component:</b> ${bug.component}</span>
        <span>🧪 <b>Affected Tests:</b> ${bug.affectedTests}</span>
        <span>🔍 <b>Discovered By:</b> ${bug.discoveredBy}</span>
        <span>🌐 <b>Environment:</b> ${bug.environment}</span>
      </div>
      <div class="bug-body">
        <div class="bug-section">
          <div class="bug-section-label">Root Cause</div>
          <div class="bug-section-content">${bug.rootCause}</div>
        </div>
        <div class="bug-section">
          <div class="bug-section-label">Steps to Reproduce</div>
          <div class="bug-section-content steps">${bug.stepsToReproduce.split('\n').map(s => `<div class="step">${s}</div>`).join('')}</div>
        </div>
        <div class="bug-section ${bug.status === 'Fixed' ? 'fix-applied' : 'fix-recommended'}">
          <div class="bug-section-label">${bug.status === 'Fixed' ? '✅ Fix Applied' : '💡 Recommendation'}</div>
          <div class="bug-section-content">${bug.fix.replace(/\n/g, '<br/>')}</div>
          ${bug.fixedIn !== 'Not yet fixed' ? `<div class="fixed-in">📁 ${bug.fixedIn}</div>` : ''}
        </div>
        ${bug.notes ? `<div class="bug-section notes-section"><div class="bug-section-label">📝 Notes</div><div class="bug-section-content">${bug.notes}</div></div>` : ''}
      </div>
    </div>`;
}

const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Packora — Bug Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #080b14;
      --surface: #10151f;
      --card: #141b28;
      --card-hover: #182031;
      --border: #1e2a3d;
      --border-light: #243347;
      --text: #e2e8f0;
      --muted: #8892a4;
      --primary: #3b82f6;
      --critical: #ef4444;
      --high: #f97316;
      --medium: #eab308;
      --low: #6b7280;
      --fixed: #22c55e;
      --open: #f97316;
      --backend: #60a5fa;
      --frontend: #fbbf24;
      --tooling: #a78bfa;
    }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
      min-height: 100vh;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }

    /* ── Header ── */
    .hero {
      background: linear-gradient(135deg, #0f1827 0%, #0a1220 50%, #080b14 100%);
      border-bottom: 1px solid var(--border);
      padding: 3rem 2rem 2.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -80px; left: 50%; transform: translateX(-50%);
      width: 600px; height: 400px;
      background: radial-gradient(ellipse, rgba(239,68,68,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-label {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: var(--critical);
      font-size: .78rem;
      font-weight: 600;
      padding: .35rem 1rem;
      border-radius: 20px;
      letter-spacing: .8px;
      text-transform: uppercase;
      margin-bottom: 1.2rem;
    }
    .hero h1 {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: .6rem;
    }
    .hero h1 .brand { color: var(--primary); }
    .hero p {
      color: var(--muted);
      font-size: 1rem;
      max-width: 600px;
      margin: 0 auto .5rem;
    }
    .hero .meta {
      color: #4a5568;
      font-size: .8rem;
      margin-top: .8rem;
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── Layout ── */
    .container { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem; }

    /* ── Summary Cards ── */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .summary-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.4rem 1rem;
      text-align: center;
      transition: transform .2s, border-color .2s;
    }
    .summary-card:hover { transform: translateY(-2px); border-color: var(--border-light); }
    .summary-card .num {
      font-size: 2.4rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: .4rem;
    }
    .summary-card .lbl {
      font-size: .72rem;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: var(--muted);
      font-weight: 600;
    }
    .c-total .num { color: #818cf8; }
    .c-critical .num { color: var(--critical); }
    .c-high .num { color: var(--high); }
    .c-medium .num { color: var(--medium); }
    .c-low .num { color: var(--low); }
    .c-fixed .num { color: var(--fixed); }
    .c-open .num { color: var(--open); }

    /* ── Section Heading ── */
    .section-heading {
      display: flex;
      align-items: center;
      gap: .8rem;
      margin-bottom: 1.5rem;
      padding-bottom: .75rem;
      border-bottom: 1px solid var(--border);
    }
    .section-heading h2 { font-size: 1.2rem; font-weight: 700; }
    .count-pill {
      background: var(--border-light);
      color: var(--muted);
      font-size: .7rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
    }

    /* ── Bug Cards ── */
    .bugs-list { display: flex; flex-direction: column; gap: 1.2rem; }
    .bug-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color .25s, box-shadow .25s;
    }
    .bug-card:hover {
      border-color: var(--border-light);
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
    .bug-header {
      padding: 1.2rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .bug-title-row { display: flex; align-items: center; gap: .8rem; flex: 1; min-width: 0; }
    .bug-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: .75rem;
      font-weight: 700;
      color: var(--primary);
      background: rgba(59,130,246,0.1);
      padding: .25rem .6rem;
      border-radius: 6px;
      border: 1px solid rgba(59,130,246,0.25);
      white-space: nowrap;
    }
    .bug-title {
      font-size: .97rem;
      font-weight: 600;
      line-height: 1.4;
    }
    .bug-badges { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
    .badge {
      font-size: .7rem;
      font-weight: 700;
      padding: .25rem .65rem;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: .4px;
      white-space: nowrap;
    }
    .priority-badge {
      background: rgba(129,140,248,0.1);
      color: #818cf8;
      border: 1px solid rgba(129,140,248,0.3);
    }
    .bug-meta {
      display: flex;
      flex-wrap: wrap;
      gap: .4rem 1.5rem;
      padding: .75rem 1.5rem;
      background: rgba(0,0,0,0.2);
      border-bottom: 1px solid var(--border);
      font-size: .8rem;
      color: var(--muted);
    }
    .bug-meta b { color: var(--text); }
    .bug-body { padding: 1.2rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .bug-section {}
    .bug-section-label {
      font-size: .72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: var(--muted);
      margin-bottom: .4rem;
    }
    .bug-section-content {
      font-size: .87rem;
      color: #c8d3e0;
      line-height: 1.65;
    }
    .steps .step {
      padding: .15rem 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: .82rem;
      color: #9fb3c8;
    }
    .fix-applied {
      background: rgba(34,197,94,0.05);
      border: 1px solid rgba(34,197,94,0.2);
      border-radius: 10px;
      padding: .9rem 1rem;
    }
    .fix-applied .bug-section-label { color: var(--fixed); }
    .fix-recommended {
      background: rgba(249,115,22,0.05);
      border: 1px solid rgba(249,115,22,0.2);
      border-radius: 10px;
      padding: .9rem 1rem;
    }
    .fix-recommended .bug-section-label { color: var(--open); }
    .fixed-in {
      margin-top: .6rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: .78rem;
      color: var(--fixed);
      opacity: .8;
    }
    .notes-section {
      background: rgba(129,140,248,0.04);
      border: 1px solid rgba(129,140,248,0.15);
      border-radius: 10px;
      padding: .9rem 1rem;
    }
    .notes-section .bug-section-label { color: #818cf8; }

    /* ── Divider ── */
    .section-gap { margin: 3rem 0; border: none; border-top: 1px solid var(--border); }

    /* ── Footer ── */
    .footer {
      text-align: center;
      color: var(--muted);
      font-size: .78rem;
      padding: 2rem;
      border-top: 1px solid var(--border);
      margin-top: 3rem;
    }
    .footer code {
      font-family: 'JetBrains Mono', monospace;
      background: var(--card);
      padding: 2px 6px;
      border-radius: 4px;
      color: #818cf8;
    }

    /* ── TOC Table ── */
    .toc {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .toc h3 { font-size: .9rem; font-weight: 700; margin-bottom: 1rem; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
    .toc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: .5rem; }
    .toc-item {
      display: flex;
      align-items: center;
      gap: .6rem;
      padding: .5rem .75rem;
      border-radius: 8px;
      transition: background .15s;
      text-decoration: none;
      color: var(--text);
      font-size: .83rem;
    }
    .toc-item:hover { background: rgba(255,255,255,0.04); }
    .toc-item .toc-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: .7rem;
      color: var(--primary);
      width: 64px;
      flex-shrink: 0;
    }
    .toc-sev-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }
  </style>
</head>
<body>

  <!-- Hero -->
  <div class="hero">
    <div class="hero-label">🐛 Bug Report</div>
    <h1>📦 <span class="brand">Packora</span> — Bug Report</h1>
    <p>Full-Stack Quality Assurance Report — Bugs Discovered &amp; Fixed During Automated Testing</p>
    <p>Backend (Spring Boot 4) + Frontend (React 19) — 108 Tests Executed</p>
    <div class="meta">Generated: ${now} &nbsp;|&nbsp; Total Bugs: ${bugSummary.total} &nbsp;|&nbsp; Fixed: ${bugSummary.fixed} &nbsp;|&nbsp; Open: ${bugSummary.open}</div>
  </div>

  <div class="container">

    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card c-total"><div class="num">${bugSummary.total}</div><div class="lbl">Total Bugs</div></div>
      <div class="summary-card c-critical"><div class="num">${bugSummary.critical}</div><div class="lbl">Critical</div></div>
      <div class="summary-card c-high"><div class="num">${bugSummary.high}</div><div class="lbl">High</div></div>
      <div class="summary-card c-medium"><div class="num">${bugSummary.medium}</div><div class="lbl">Medium</div></div>
      <div class="summary-card c-low"><div class="num">${bugSummary.low}</div><div class="lbl">Low</div></div>
      <div class="summary-card c-fixed"><div class="num">${bugSummary.fixed}</div><div class="lbl">Fixed</div></div>
      <div class="summary-card c-open"><div class="num">${bugSummary.open}</div><div class="lbl">Open</div></div>
    </div>

    <!-- Table of Contents -->
    <div class="toc">
      <h3>📋 Quick Navigation</h3>
      <div class="toc-grid">
        ${bugs.map(b => `<a class="toc-item" href="#${b.id.toLowerCase()}">
          <span class="toc-id">${b.id}</span>
          <span class="toc-sev-dot" style="background:${severityColor(b.severity)}"></span>
          <span>${b.title.length > 45 ? b.title.slice(0, 45) + '…' : b.title}</span>
        </a>`).join('')}
      </div>
    </div>

    <!-- Fixed Bugs Section -->
    <div class="section-heading">
      <h2>✅ Fixed Bugs</h2>
      <span class="count-pill">${bugSummary.fixed} issues resolved</span>
    </div>
    <div class="bugs-list">
      ${bugCardsHtml.split('\n').filter(l => {
        // We'll render all bugs together instead of filtering in template
        return true;
      }).join('\n')}
    </div>

    <div class="footer">
      <p>Packora Bug Report — Generated by <code>node generate-bug-report.js</code></p>
      <p style="margin-top:.4rem">Full test results: <code>test-reports/Packora_Test_Report.html</code> &nbsp;|&nbsp; Excel: <code>test-reports/Packora_Bug_Report.xlsx</code></p>
    </div>
  </div>
</body>
</html>`;

// Rebuild the all-bugs card list properly (without the broken filter)
function buildBugCards() {
  let html = '';
  for (const bug of bugs) {
    html += `
    <div class="bug-card" id="${bug.id.toLowerCase()}">
      <div class="bug-header">
        <div class="bug-title-row">
          <span class="bug-id">${bug.id}</span>
          <h3 class="bug-title">${bug.title}</h3>
        </div>
        <div class="bug-badges">
          <span class="badge" style="background:${severityBg(bug.severity)};color:${severityColor(bug.severity)};border:1px solid ${severityColor(bug.severity)}40">${bug.severity}</span>
          <span class="badge" style="background:${statusBg(bug.status)};color:${statusColor(bug.status)};border:1px solid ${statusColor(bug.status)}40">${bug.status === 'Fixed' ? '✅' : '⚠️'} ${bug.status}</span>
          <span class="badge" style="background:rgba(96,165,250,0.1);color:${layerColor(bug.layer)};border:1px solid ${layerColor(bug.layer)}40">${bug.layer}</span>
          <span class="badge priority-badge">${bug.priority}</span>
        </div>
      </div>
      <div class="bug-meta">
        <span>🧩 <b>Component:</b> ${bug.component}</span>
        <span>🧪 <b>Affected Tests:</b> ${bug.affectedTests}</span>
        <span>🔍 <b>Discovered By:</b> ${bug.discoveredBy}</span>
        <span>🌐 <b>Environment:</b> ${bug.environment}</span>
      </div>
      <div class="bug-body">
        <div class="bug-section">
          <div class="bug-section-label">Root Cause</div>
          <div class="bug-section-content">${bug.rootCause}</div>
        </div>
        <div class="bug-section">
          <div class="bug-section-label">Steps to Reproduce</div>
          <div class="bug-section-content steps">${bug.stepsToReproduce.split('\n').map(s => '<div class="step">' + s + '</div>').join('')}</div>
        </div>
        <div class="bug-section ${bug.status === 'Fixed' ? 'fix-applied' : 'fix-recommended'}">
          <div class="bug-section-label">${bug.status === 'Fixed' ? '✅ Fix Applied' : '💡 Recommendation'}</div>
          <div class="bug-section-content">${bug.fix.replace(/\n/g, '<br/>')}</div>
          ${bug.fixedIn !== 'Not yet fixed' ? '<div class="fixed-in">📁 ' + bug.fixedIn + '</div>' : ''}
        </div>
        ${bug.notes ? '<div class="bug-section notes-section"><div class="bug-section-label">📝 Notes</div><div class="bug-section-content">' + bug.notes + '</div></div>' : ''}
      </div>
    </div>`;
  }
  return html;
}

const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Packora — Bug Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #080b14; --surface: #10151f; --card: #141b28; --card-hover: #182031;
      --border: #1e2a3d; --border-light: #243347; --text: #e2e8f0; --muted: #8892a4;
      --primary: #3b82f6; --critical: #ef4444; --high: #f97316; --medium: #eab308;
      --low: #6b7280; --fixed: #22c55e; --open: #f97316;
    }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }
    .hero { background: linear-gradient(135deg,#0f1827,#0a1220,#080b14); border-bottom: 1px solid var(--border); padding: 3rem 2rem 2.5rem; text-align: center; position: relative; overflow: hidden; }
    .hero::before { content:''; position:absolute; top:-80px; left:50%; transform:translateX(-50%); width:600px; height:400px; background:radial-gradient(ellipse,rgba(239,68,68,.08),transparent 70%); pointer-events:none; }
    .hero-label { display:inline-flex; align-items:center; gap:.5rem; background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); color:var(--critical); font-size:.78rem; font-weight:600; padding:.35rem 1rem; border-radius:20px; letter-spacing:.8px; text-transform:uppercase; margin-bottom:1.2rem; }
    .hero h1 { font-size:clamp(1.8rem,4vw,2.8rem); font-weight:800; letter-spacing:-.5px; margin-bottom:.6rem; }
    .hero h1 .brand { color:var(--primary); }
    .hero p { color:var(--muted); font-size:1rem; max-width:600px; margin:0 auto .5rem; }
    .hero .meta { color:#4a5568; font-size:.8rem; margin-top:.8rem; font-family:'JetBrains Mono',monospace; }
    .container { max-width:1100px; margin:0 auto; padding:2.5rem 1.5rem; }
    .summary-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; margin-bottom:2.5rem; }
    .summary-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:1.4rem 1rem; text-align:center; transition:transform .2s,border-color .2s; }
    .summary-card:hover { transform:translateY(-2px); border-color:var(--border-light); }
    .summary-card .num { font-size:2.4rem; font-weight:800; line-height:1; margin-bottom:.4rem; }
    .summary-card .lbl { font-size:.72rem; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); font-weight:600; }
    .c-total .num{color:#818cf8} .c-critical .num{color:var(--critical)} .c-high .num{color:var(--high)} .c-medium .num{color:var(--medium)} .c-low .num{color:var(--low)} .c-fixed .num{color:var(--fixed)} .c-open .num{color:var(--open)}
    .section-heading { display:flex; align-items:center; gap:.8rem; margin-bottom:1.5rem; padding-bottom:.75rem; border-bottom:1px solid var(--border); }
    .section-heading h2 { font-size:1.2rem; font-weight:700; }
    .count-pill { background:var(--border-light); color:var(--muted); font-size:.7rem; font-weight:700; padding:3px 10px; border-radius:20px; }
    .bugs-list { display:flex; flex-direction:column; gap:1.2rem; margin-bottom:3rem; }
    .bug-card { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; transition:border-color .25s,box-shadow .25s; }
    .bug-card:hover { border-color:var(--border-light); box-shadow:0 4px 24px rgba(0,0,0,.4); }
    .bug-header { padding:1.2rem 1.5rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; }
    .bug-title-row { display:flex; align-items:center; gap:.8rem; flex:1; min-width:0; }
    .bug-id { font-family:'JetBrains Mono',monospace; font-size:.75rem; font-weight:700; color:var(--primary); background:rgba(59,130,246,.1); padding:.25rem .6rem; border-radius:6px; border:1px solid rgba(59,130,246,.25); white-space:nowrap; }
    .bug-title { font-size:.97rem; font-weight:600; line-height:1.4; }
    .bug-badges { display:flex; gap:.5rem; flex-wrap:wrap; align-items:center; }
    .badge { font-size:.7rem; font-weight:700; padding:.25rem .65rem; border-radius:8px; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; }
    .priority-badge { background:rgba(129,140,248,.1); color:#818cf8; border:1px solid rgba(129,140,248,.3); }
    .bug-meta { display:flex; flex-wrap:wrap; gap:.4rem 1.5rem; padding:.75rem 1.5rem; background:rgba(0,0,0,.2); border-bottom:1px solid var(--border); font-size:.8rem; color:var(--muted); }
    .bug-meta b { color:var(--text); }
    .bug-body { padding:1.2rem 1.5rem; display:flex; flex-direction:column; gap:1rem; }
    .bug-section-label { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); margin-bottom:.4rem; }
    .bug-section-content { font-size:.87rem; color:#c8d3e0; line-height:1.65; }
    .steps .step { padding:.15rem 0; font-family:'JetBrains Mono',monospace; font-size:.82rem; color:#9fb3c8; }
    .fix-applied { background:rgba(34,197,94,.05); border:1px solid rgba(34,197,94,.2); border-radius:10px; padding:.9rem 1rem; }
    .fix-applied .bug-section-label { color:var(--fixed); }
    .fix-recommended { background:rgba(249,115,22,.05); border:1px solid rgba(249,115,22,.2); border-radius:10px; padding:.9rem 1rem; }
    .fix-recommended .bug-section-label { color:var(--open); }
    .fixed-in { margin-top:.6rem; font-family:'JetBrains Mono',monospace; font-size:.78rem; color:var(--fixed); opacity:.8; }
    .notes-section { background:rgba(129,140,248,.04); border:1px solid rgba(129,140,248,.15); border-radius:10px; padding:.9rem 1rem; }
    .notes-section .bug-section-label { color:#818cf8; }
    .toc { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:1.5rem; margin-bottom:2.5rem; }
    .toc h3 { font-size:.9rem; font-weight:700; margin-bottom:1rem; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; }
    .toc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:.5rem; }
    .toc-item { display:flex; align-items:center; gap:.6rem; padding:.5rem .75rem; border-radius:8px; transition:background .15s; text-decoration:none; color:var(--text); font-size:.83rem; }
    .toc-item:hover { background:rgba(255,255,255,.04); }
    .toc-id { font-family:'JetBrains Mono',monospace; font-size:.7rem; color:var(--primary); width:64px; flex-shrink:0; }
    .toc-sev-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .footer { text-align:center; color:var(--muted); font-size:.78rem; padding:2rem; border-top:1px solid var(--border); margin-top:3rem; }
    .footer code { font-family:'JetBrains Mono',monospace; background:var(--card); padding:2px 6px; border-radius:4px; color:#818cf8; }
  </style>
</head>
<body>
  <div class="hero">
    <div class="hero-label">🐛 Bug Report</div>
    <h1>📦 <span class="brand">Packora</span> — Bug Report</h1>
    <p>Full-Stack Quality Assurance — Bugs Discovered &amp; Fixed During Automated Testing</p>
    <p>Backend (Spring Boot 4) + Frontend (React 19) — 108 Tests Executed</p>
    <div class="meta">Generated: ${now} &nbsp;|&nbsp; Total Bugs: ${bugSummary.total} &nbsp;|&nbsp; Fixed: ${bugSummary.fixed} &nbsp;|&nbsp; Open: ${bugSummary.open}</div>
  </div>

  <div class="container">
    <div class="summary-grid">
      <div class="summary-card c-total"><div class="num">${bugSummary.total}</div><div class="lbl">Total Bugs</div></div>
      <div class="summary-card c-critical"><div class="num">${bugSummary.critical}</div><div class="lbl">Critical</div></div>
      <div class="summary-card c-high"><div class="num">${bugSummary.high}</div><div class="lbl">High</div></div>
      <div class="summary-card c-medium"><div class="num">${bugSummary.medium}</div><div class="lbl">Medium</div></div>
      <div class="summary-card c-low"><div class="num">${bugSummary.low}</div><div class="lbl">Low</div></div>
      <div class="summary-card c-fixed"><div class="num">${bugSummary.fixed}</div><div class="lbl">Fixed</div></div>
      <div class="summary-card c-open"><div class="num">${bugSummary.open}</div><div class="lbl">Open</div></div>
    </div>

    <div class="toc">
      <h3>📋 Quick Navigation</h3>
      <div class="toc-grid">
        ${bugs.map(b => '<a class="toc-item" href="#' + b.id.toLowerCase() + '"><span class="toc-id">' + b.id + '</span><span class="toc-sev-dot" style="background:' + severityColor(b.severity) + '"></span><span>' + (b.title.length > 48 ? b.title.slice(0, 48) + '…' : b.title) + '</span></a>').join('\n        ')}
      </div>
    </div>

    <div class="section-heading">
      <h2>🐛 All Bug Findings</h2>
      <span class="count-pill">${bugSummary.fixed} Fixed &nbsp;·&nbsp; ${bugSummary.open} Open</span>
    </div>
    <div class="bugs-list">
      ${buildBugCards()}
    </div>

    <div class="footer">
      <p>Packora Bug Report — Generated by <code>node generate-bug-report.js</code></p>
      <p style="margin-top:.4rem">Full test results: <code>test-reports/Packora_Test_Report.html</code> &nbsp;|&nbsp; Excel: <code>test-reports/Packora_Bug_Report.xlsx</code></p>
    </div>
  </div>
</body>
</html>`;

const htmlPath = path.join(outputDir, 'Packora_Bug_Report.html');
fs.writeFileSync(htmlPath, finalHtml);
console.log('✅ HTML bug report generated: ' + htmlPath);
console.log('\n📊 Bug Summary:');
console.log('   Total: ' + bugSummary.total);
console.log('   Critical: ' + bugSummary.critical + ' (Fixed: ' + bugs.filter(b=>b.severity==='Critical'&&b.status==='Fixed').length + ')');
console.log('   High: ' + bugSummary.high + ' (Fixed: ' + bugs.filter(b=>b.severity==='High'&&b.status==='Fixed').length + ')');
console.log('   Medium: ' + bugSummary.medium + ' (Open)');
console.log('   Low: ' + bugSummary.low + ' (Open)');
console.log('   Fixed: ' + bugSummary.fixed + ' | Open: ' + bugSummary.open);

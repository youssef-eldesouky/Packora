/**
 * Packora Plain-Text Report Generator
 * Outputs a formatted .txt report covering all tests + bug findings.
 * Run: node generate-text-report.js
 */

const fs   = require('fs');
const path = require('path');

const now = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });

// ─────────────────────────────────────────────
//  TEST DATA
// ─────────────────────────────────────────────
const backendTests = [
  { id:'BE-001', suite:'BackendApplicationTests',  testName:'contextLoads',                                           type:'Integration', component:'Spring Boot Application',   description:'Verifies the Spring Boot application context loads with all beans', status:'PASS', duration:'1.625s' },
  { id:'BE-002', suite:'ProductRepositoryTest',    testName:'saveProduct_shouldPersistAndGenerateId',                 type:'Database',     component:'Repository / Product',       description:'DB-001: Save a new product and verify it is persisted',              status:'PASS', duration:'12ms'   },
  { id:'BE-003', suite:'ProductRepositoryTest',    testName:'saveProduct_shouldPersistSizesAndMaterials',             type:'Database',     component:'Repository / Product',       description:'DB-002: Save product with sizes and materials (ElementCollection)',   status:'PASS', duration:'8ms'    },
  { id:'BE-004', suite:'ProductRepositoryTest',    testName:'findById_shouldReturnProduct',                           type:'Database',     component:'Repository / Product',       description:'DB-003: Find product by ID',                                          status:'PASS', duration:'6ms'    },
  { id:'BE-005', suite:'ProductRepositoryTest',    testName:'findById_shouldReturnEmptyForNonExistent',               type:'Database',     component:'Repository / Product',       description:'DB-004: Find product by ID returns empty for non-existent ID',        status:'PASS', duration:'4ms'    },
  { id:'BE-006', suite:'ProductRepositoryTest',    testName:'findByName_shouldReturnMatchingProduct',                 type:'Database',     component:'Repository / Product',       description:'DB-005: Find product by exact name',                                  status:'PASS', duration:'7ms'    },
  { id:'BE-007', suite:'ProductRepositoryTest',    testName:'findByCategory_shouldReturnAllInCategory',               type:'Database',     component:'Repository / Product',       description:'DB-006: Find products by category',                                   status:'PASS', duration:'9ms'    },
  { id:'BE-008', suite:'ProductRepositoryTest',    testName:'findByCategory_shouldReturnEmptyForUnknown',             type:'Database',     component:'Repository / Product',       description:'DB-007: Find products by unknown category returns empty',             status:'PASS', duration:'5ms'    },
  { id:'BE-009', suite:'ProductRepositoryTest',    testName:'findByInStockTrue_shouldReturnOnlyInStockProducts',      type:'Database',     component:'Repository / Product',       description:'DB-008: Find only in-stock products',                                 status:'PASS', duration:'8ms'    },
  { id:'BE-010', suite:'ProductRepositoryTest',    testName:'findByCategoryAndInStockTrue_shouldFilterByCategoryAndStock', type:'Database', component:'Repository / Product',     description:'DB-009: Find in-stock products by category',                          status:'PASS', duration:'8ms'    },
  { id:'BE-011', suite:'ProductRepositoryTest',    testName:'findByNameContainingIgnoreCase_shouldSearchCaseInsensitive', type:'Database', component:'Repository / Product',     description:'DB-010: Search products by name keyword (case-insensitive)',          status:'PASS', duration:'11ms'   },
  { id:'BE-012', suite:'ProductRepositoryTest',    testName:'findByNameContainingIgnoreCase_shouldReturnEmptyForNoMatch',type:'Database',  component:'Repository / Product',     description:'DB-011: Search with no matching keyword returns empty list',          status:'PASS', duration:'5ms'    },
  { id:'BE-013', suite:'ProductRepositoryTest',    testName:'findAll_shouldReturnAllProducts',                        type:'Database',     component:'Repository / Product',       description:'DB-012: Find all products',                                           status:'PASS', duration:'9ms'    },
  { id:'BE-014', suite:'ProductRepositoryTest',    testName:'updateProduct_shouldPersistPriceChange',                 type:'Database',     component:'Repository / Product',       description:'DB-013: Update product price',                                        status:'PASS', duration:'8ms'    },
  { id:'BE-015', suite:'ProductRepositoryTest',    testName:'updateProduct_shouldPersistStockChange',                 type:'Database',     component:'Repository / Product',       description:'DB-014: Update product stock status',                                 status:'PASS', duration:'7ms'    },
  { id:'BE-016', suite:'ProductRepositoryTest',    testName:'deleteById_shouldRemoveProduct',                         type:'Database',     component:'Repository / Product',       description:'DB-015: Delete product by ID',                                        status:'PASS', duration:'7ms'    },
  { id:'BE-017', suite:'ProductRepositoryTest',    testName:'deleteAll_shouldClearTable',                             type:'Database',     component:'Repository / Product',       description:'DB-016: Delete all products',                                         status:'PASS', duration:'8ms'    },
  { id:'BE-018', suite:'ProductRepositoryTest',    testName:'count_shouldReturnCorrectCount',                         type:'Database',     component:'Repository / Product',       description:'DB-017: Product count returns correct number',                        status:'PASS', duration:'6ms'    },
  { id:'BE-019', suite:'ProductRepositoryTest',    testName:'save_shouldAutoGenerateCreatedAt',                       type:'Database',     component:'Repository / Product',       description:'DB-018: CreatedAt timestamp is auto-generated',                       status:'PASS', duration:'7ms'    },
  { id:'BE-020', suite:'UserRepositoryTest',       testName:'saveBusinessOwner_shouldPersistWithAllFields',           type:'Database',     component:'Repository / User',          description:'DB-019: Save a BusinessOwner and verify persistence',                 status:'PASS', duration:'9ms'    },
  { id:'BE-021', suite:'UserRepositoryTest',       testName:'saveAdmin_shouldPersistWithDiscriminator',               type:'Database',     component:'Repository / User',          description:'DB-020: Save an Admin user (STI discrimination)',                     status:'PASS', duration:'7ms'    },
  { id:'BE-022', suite:'UserRepositoryTest',       testName:'findByEmail_shouldReturnUser',                           type:'Database',     component:'Repository / User',          description:'DB-021: Find user by email',                                          status:'PASS', duration:'6ms'    },
  { id:'BE-023', suite:'UserRepositoryTest',       testName:'findByEmail_shouldReturnEmptyForNonExistent',            type:'Database',     component:'Repository / User',          description:'DB-022: Find user by email returns empty for non-existent',           status:'PASS', duration:'4ms'    },
  { id:'BE-024', suite:'UserRepositoryTest',       testName:'findByUsername_shouldReturnUser',                        type:'Database',     component:'Repository / User',          description:'DB-023: Find user by username',                                       status:'PASS', duration:'6ms'    },
  { id:'BE-025', suite:'UserRepositoryTest',       testName:'findByUsername_shouldReturnEmptyForNonExistent',         type:'Database',     component:'Repository / User',          description:'DB-024: Find user by username returns empty for non-existent',        status:'PASS', duration:'4ms'    },
  { id:'BE-026', suite:'UserRepositoryTest',       testName:'existsByEmail_shouldReturnTrueWhenExists',               type:'Database',     component:'Repository / User',          description:'DB-025: existsByEmail returns true for existing email',               status:'PASS', duration:'6ms'    },
  { id:'BE-027', suite:'UserRepositoryTest',       testName:'existsByEmail_shouldReturnFalseWhenNotExists',           type:'Database',     component:'Repository / User',          description:'DB-026: existsByEmail returns false for non-existing email',          status:'PASS', duration:'3ms'    },
  { id:'BE-028', suite:'UserRepositoryTest',       testName:'existsByUsername_shouldReturnTrueWhenExists',            type:'Database',     component:'Repository / User',          description:'DB-027: existsByUsername returns true for existing username',         status:'PASS', duration:'5ms'    },
  { id:'BE-029', suite:'UserRepositoryTest',       testName:'existsByUsername_shouldReturnFalseWhenNotExists',        type:'Database',     component:'Repository / User',          description:'DB-028: existsByUsername returns false for non-existing username',    status:'PASS', duration:'3ms'    },
  { id:'BE-030', suite:'UserRepositoryTest',       testName:'updateUser_shouldPersistPhoneChange',                    type:'Database',     component:'Repository / User',          description:'DB-029: Update user phone number',                                    status:'PASS', duration:'8ms'    },
  { id:'BE-031', suite:'UserRepositoryTest',       testName:'updateUser_shouldPersistCompanyNameChange',              type:'Database',     component:'Repository / User',          description:'DB-030: Update user company name',                                    status:'PASS', duration:'8ms'    },
  { id:'BE-032', suite:'UserRepositoryTest',       testName:'deleteById_shouldRemoveUser',                            type:'Database',     component:'Repository / User',          description:'DB-031: Delete user by ID',                                           status:'PASS', duration:'7ms'    },
  { id:'BE-033', suite:'UserRepositoryTest',       testName:'singleTableInheritance_shouldStoreAllSubtypesInOneTable',type:'Database',     component:'Repository / User',          description:'DB-032: Both Admin and BusinessOwner stored in same table',           status:'PASS', duration:'9ms'    },
  { id:'BE-034', suite:'UserRepositoryTest',       testName:'businessOwner_shouldHaveCorrectRole',                    type:'Database',     component:'Repository / User',          description:'DB-033: BusinessOwner role is BUSINESS_OWNER via discriminator',      status:'PASS', duration:'6ms'    },
  { id:'BE-035', suite:'UserRepositoryTest',       testName:'save_shouldAutoGenerateCreatedAt',                       type:'Database',     component:'Repository / User',          description:'DB-034: CreatedAt timestamp is auto-generated on save',               status:'PASS', duration:'6ms'    },
  { id:'BE-036', suite:'UserRepositoryTest',       testName:'save_shouldRejectDuplicateEmail',                        type:'Database',     component:'Repository / User',          description:'DB-035: Cannot save two users with same email',                       status:'PASS', duration:'12ms'   },
  { id:'BE-037', suite:'UserRepositoryTest',       testName:'save_shouldRejectDuplicateUsername',                     type:'Database',     component:'Repository / User',          description:'DB-036: Cannot save two users with same username',                    status:'PASS', duration:'11ms'   },
  { id:'BE-038', suite:'OrderRepositoryTest',      testName:'saveOrder_shouldPersistWithAllFields',                   type:'Database',     component:'Repository / Order',         description:'DB-037: Save a new order and verify persistence',                     status:'PASS', duration:'8ms'    },
  { id:'BE-039', suite:'OrderRepositoryTest',      testName:'saveOrder_shouldDefaultToPending',                       type:'Database',     component:'Repository / Order',         description:'DB-038: Order defaults to PENDING status',                            status:'PASS', duration:'7ms'    },
  { id:'BE-040', suite:'OrderRepositoryTest',      testName:'findById_shouldReturnOrder',                             type:'Database',     component:'Repository / Order',         description:'DB-039: Find order by ID',                                            status:'PASS', duration:'5ms'    },
  { id:'BE-041', suite:'OrderRepositoryTest',      testName:'findByUserId_shouldReturnUserOrders',                    type:'Database',     component:'Repository / Order',         description:'DB-040: Find orders by user ID',                                      status:'PASS', duration:'9ms'    },
  { id:'BE-042', suite:'OrderRepositoryTest',      testName:'findByStatus_shouldReturnMatchingOrders',                type:'Database',     component:'Repository / Order',         description:'DB-041: Find orders by status',                                       status:'PASS', duration:'8ms'    },
  { id:'BE-043', suite:'OrderRepositoryTest',      testName:'findByUserIdOrderByOrderDateDesc_shouldReturnSorted',    type:'Database',     component:'Repository / Order',         description:'DB-042: Find user orders ordered by date descending',                 status:'PASS', duration:'9ms'    },
  { id:'BE-044', suite:'OrderRepositoryTest',      testName:'findTop5ByOrderByOrderDateDesc_shouldReturnMaxFive',     type:'Database',     component:'Repository / Order',         description:'DB-043: Find top 5 recent orders',                                    status:'PASS', duration:'12ms'   },
  { id:'BE-045', suite:'OrderRepositoryTest',      testName:'findByBulkGroupId_shouldReturnGroupedOrders',            type:'Database',     component:'Repository / Order',         description:'DB-044: Find orders by bulk group ID',                                status:'PASS', duration:'9ms'    },
  { id:'BE-046', suite:'OrderRepositoryTest',      testName:'countOrders_shouldReturnCorrectCount',                   type:'Database',     component:'Repository / Order',         description:'DB-045: Count all orders',                                            status:'PASS', duration:'6ms'    },
  { id:'BE-047', suite:'OrderRepositoryTest',      testName:'sumRevenue_shouldExcludeCancelled',                      type:'Database',     component:'Repository / Order',         description:'DB-046: Sum revenue excludes cancelled orders',                       status:'PASS', duration:'8ms'    },
  { id:'BE-048', suite:'OrderRepositoryTest',      testName:'updateStatus_shouldPersistChange',                       type:'Database',     component:'Repository / Order',         description:'DB-047: Update order status to SHIPPED',                              status:'PASS', duration:'7ms'    },
  { id:'BE-049', suite:'OrderRepositoryTest',      testName:'cancelOrder_shouldSetStatusToCancelled',                 type:'Database',     component:'Repository / Order',         description:'DB-048: Cancel order by updating status',                             status:'PASS', duration:'7ms'    },
  { id:'BE-050', suite:'OrderRepositoryTest',      testName:'deleteById_shouldRemoveOrder',                           type:'Database',     component:'Repository / Order',         description:'DB-049: Delete order by ID',                                          status:'PASS', duration:'6ms'    },
  { id:'BE-051', suite:'OrderRepositoryTest',      testName:'save_shouldAutoGenerateOrderDate',                       type:'Database',     component:'Repository / Order',         description:'DB-050: OrderDate timestamp is auto-generated',                       status:'PASS', duration:'6ms'    },
  { id:'BE-052', suite:'TicketRepositoryTest',     testName:'saveGuestTicket_shouldPersistWithAllFields',             type:'Database',     component:'Repository / Ticket',        description:'DB-051: Save a guest support ticket and verify persistence',          status:'PASS', duration:'7ms'    },
  { id:'BE-053', suite:'TicketRepositoryTest',     testName:'saveUserTicket_shouldPersistWithUserAndStaffAssociations',type:'Database',    component:'Repository / Ticket',        description:'DB-052: Save a user support ticket with associations',                status:'PASS', duration:'9ms'    },
  { id:'BE-054', suite:'TicketRepositoryTest',     testName:'findById_shouldReturnTicket',                            type:'Database',     component:'Repository / Ticket',        description:'DB-053: Find ticket by ID',                                           status:'PASS', duration:'5ms'    },
  { id:'BE-055', suite:'TicketRepositoryTest',     testName:'findByUserId_shouldReturnAssociatedTickets',             type:'Database',     component:'Repository / Ticket',        description:'DB-054: Find tickets by user ID',                                     status:'PASS', duration:'10ms'   },
  { id:'BE-056', suite:'TicketRepositoryTest',     testName:'findByAssignedStaffId_shouldReturnStaffTickets',         type:'Database',     component:'Repository / Ticket',        description:'DB-055: Find tickets by assigned staff ID',                           status:'PASS', duration:'7ms'    },
  { id:'BE-057', suite:'TicketRepositoryTest',     testName:'findByStatus_shouldFilterTickets',                       type:'Database',     component:'Repository / Ticket',        description:'DB-056: Find tickets by status',                                      status:'PASS', duration:'8ms'    },
  { id:'BE-058', suite:'TicketRepositoryTest',     testName:'updateTicket_shouldPersistStatusAndStaffChanges',        type:'Database',     component:'Repository / Ticket',        description:'DB-057: Update ticket status and assigned staff',                     status:'PASS', duration:'8ms'    },
  { id:'BE-059', suite:'TicketRepositoryTest',     testName:'deleteById_shouldRemoveTicket',                          type:'Database',     component:'Repository / Ticket',        description:'DB-058: Delete ticket by ID',                                         status:'PASS', duration:'5ms'    },
  { id:'BE-060', suite:'TicketRepositoryTest',     testName:'save_shouldAutoGenerateTimestamps',                      type:'Database',     component:'Repository / Ticket',        description:'DB-059: Ticket timestamps are auto-generated',                        status:'PASS', duration:'6ms'    },
];

const frontendTests = [
  { id:'FE-001', suite:'adminFormat.test.js',     testName:'parseAmount - returns number as-is when given a number',      type:'Unit',      component:'Utils / adminFormat',        description:'Tests parseAmount returns numeric input unchanged',                  status:'PASS', duration:'1ms'  },
  { id:'FE-002', suite:'adminFormat.test.js',     testName:'parseAmount - strips currency symbols and returns a number',  type:'Unit',      component:'Utils / adminFormat',        description:'Tests parseAmount extracts numeric value from currency strings',     status:'PASS', duration:'1ms'  },
  { id:'FE-003', suite:'adminFormat.test.js',     testName:'parseAmount - returns 0 for null or undefined',               type:'Unit',      component:'Utils / adminFormat',        description:'Tests parseAmount returns 0 for falsy input',                        status:'PASS', duration:'1ms'  },
  { id:'FE-004', suite:'adminFormat.test.js',     testName:'parseAmount - returns 0 for non-numeric strings',             type:'Unit',      component:'Utils / adminFormat',        description:'Tests parseAmount returns 0 for alphabetic strings',                 status:'PASS', duration:'1ms'  },
  { id:'FE-005', suite:'adminFormat.test.js',     testName:'formatMoney - formats integer amounts in EGP without decimals',type:'Unit',     component:'Utils / adminFormat',        description:'Tests formatMoney produces "EGP 1,000" format',                     status:'PASS', duration:'17ms' },
  { id:'FE-006', suite:'adminFormat.test.js',     testName:'formatMoney - formats zero correctly',                        type:'Unit',      component:'Utils / adminFormat',        description:'Tests formatMoney handles zero value',                               status:'PASS', duration:'1ms'  },
  { id:'FE-007', suite:'adminFormat.test.js',     testName:'formatMoneyDecimal - formats amounts with 2 decimal places',  type:'Unit',      component:'Utils / adminFormat',        description:'Tests formatMoneyDecimal produces 2-decimal output',                 status:'PASS', duration:'1ms'  },
  { id:'FE-008', suite:'adminFormat.test.js',     testName:'formatMoneyDecimal - formats zero with decimals',             type:'Unit',      component:'Utils / adminFormat',        description:'Tests formatMoneyDecimal handles zero with "0.00"',                  status:'PASS', duration:'1ms'  },
  { id:'FE-009', suite:'api.test.js',             testName:'getStoredToken - returns null when localStorage is empty',     type:'Unit',      component:'Utils / api',                description:'Tests JWT token retrieval returns null when no auth stored',         status:'PASS', duration:'1ms'  },
  { id:'FE-010', suite:'api.test.js',             testName:'getStoredToken - returns the token when valid auth stored',   type:'Unit',      component:'Utils / api',                description:'Tests JWT token retrieval from valid localStorage data',             status:'PASS', duration:'1ms'  },
  { id:'FE-011', suite:'api.test.js',             testName:'getStoredToken - returns null when data has no token field',  type:'Unit',      component:'Utils / api',                description:'Tests JWT retrieval handles missing token key',                      status:'PASS', duration:'1ms'  },
  { id:'FE-012', suite:'api.test.js',             testName:'getStoredToken - returns null when stored data is malformed', type:'Unit',      component:'Utils / api',                description:'Tests JWT retrieval handles corrupted localStorage data',            status:'PASS', duration:'1ms'  },
  { id:'FE-013', suite:'api.test.js',             testName:'API_BASE - is a non-empty string',                            type:'Unit',      component:'Utils / api',                description:'Validates API_BASE constant type',                                   status:'PASS', duration:'1ms'  },
  { id:'FE-014', suite:'api.test.js',             testName:'API_BASE - defaults to localhost when no env var set',        type:'Unit',      component:'Utils / api',                description:'Tests API_BASE falls back to http://localhost:8080',                 status:'PASS', duration:'1ms'  },
  { id:'FE-015', suite:'AuthContext.test.js',     testName:'emailToDisplayName - converts dot-separated email',           type:'Unit',      component:'Context / AuthContext',      description:'Tests john.doe@mail.com => "John Doe"',                             status:'PASS', duration:'1ms'  },
  { id:'FE-016', suite:'AuthContext.test.js',     testName:'emailToDisplayName - converts underscore-separated email',   type:'Unit',      component:'Context / AuthContext',      description:'Tests jane_smith@example.com => "Jane Smith"',                      status:'PASS', duration:'1ms'  },
  { id:'FE-017', suite:'AuthContext.test.js',     testName:'emailToDisplayName - converts hyphen-separated email',       type:'Unit',      component:'Context / AuthContext',      description:'Tests ali-hassan@packora.com => "Ali Hassan"',                      status:'PASS', duration:'1ms'  },
  { id:'FE-018', suite:'AuthContext.test.js',     testName:'emailToDisplayName - handles single word prefix',            type:'Unit',      component:'Context / AuthContext',      description:'Tests admin@packora.com => "Admin"',                                status:'PASS', duration:'1ms'  },
  { id:'FE-019', suite:'AuthContext.test.js',     testName:'emailToDisplayName - returns "User" for empty string',       type:'Unit',      component:'Context / AuthContext',      description:'Tests fallback for empty input',                                     status:'PASS', duration:'1ms'  },
  { id:'FE-020', suite:'AuthContext.test.js',     testName:'emailToDisplayName - returns "User" for null',               type:'Unit',      component:'Context / AuthContext',      description:'Tests null safety',                                                  status:'PASS', duration:'1ms'  },
  { id:'FE-021', suite:'AuthContext.test.js',     testName:'emailToDisplayName - handles email with numbers',            type:'Unit',      component:'Context / AuthContext',      description:'Tests user123@mail.com => "User123"',                               status:'PASS', duration:'1ms'  },
  { id:'FE-022', suite:'LoginPage.test.jsx',      testName:'renders the page title "Welcome Back"',                      type:'Component', component:'LoginPage',                  description:'Verifies main heading renders',                                      status:'PASS', duration:'36ms' },
  { id:'FE-023', suite:'LoginPage.test.jsx',      testName:'renders subtitle text',                                      type:'Component', component:'LoginPage',                  description:'Verifies subtitle renders',                                          status:'PASS', duration:'6ms'  },
  { id:'FE-024', suite:'LoginPage.test.jsx',      testName:'renders email and password input fields',                    type:'Component', component:'LoginPage',                  description:'Verifies form inputs exist with labels',                             status:'PASS', duration:'10ms' },
  { id:'FE-025', suite:'LoginPage.test.jsx',      testName:'renders the Sign In button',                                 type:'Component', component:'LoginPage',                  description:'Verifies submit button renders',                                     status:'PASS', duration:'32ms' },
  { id:'FE-026', suite:'LoginPage.test.jsx',      testName:'renders "Forgot password?" link',                            type:'Component', component:'LoginPage',                  description:'Verifies password recovery link',                                    status:'PASS', duration:'5ms'  },
  { id:'FE-027', suite:'LoginPage.test.jsx',      testName:'renders "Create one now" sign-up link',                      type:'Component', component:'LoginPage',                  description:'Verifies sign-up navigation link',                                   status:'PASS', duration:'4ms'  },
  { id:'FE-028', suite:'LoginPage.test.jsx',      testName:'renders Remember me checkbox',                               type:'Component', component:'LoginPage',                  description:'Verifies remember-me checkbox renders',                              status:'PASS', duration:'7ms'  },
  { id:'FE-029', suite:'LoginPage.test.jsx',      testName:'email input accepts typed text',                             type:'Component', component:'LoginPage',                  description:'Simulates user typing in email field',                               status:'PASS', duration:'47ms' },
  { id:'FE-030', suite:'LoginPage.test.jsx',      testName:'password input accepts typed text',                          type:'Component', component:'LoginPage',                  description:'Simulates user typing in password field',                            status:'PASS', duration:'28ms' },
  { id:'FE-031', suite:'LoginPage.test.jsx',      testName:'shows "Signing in..." when form is submitted',              type:'Component', component:'LoginPage',                  description:'Verifies loading state on form submission',                          status:'PASS', duration:'62ms' },
  { id:'FE-032', suite:'LoginPage.test.jsx',      testName:'shows error message on failed login',                        type:'Component', component:'LoginPage',                  description:'Tests server error message display',                                 status:'PASS', duration:'63ms' },
  { id:'FE-033', suite:'LoginPage.test.jsx',      testName:'shows connection error when fetch throws',                   type:'Component', component:'LoginPage',                  description:'Tests network failure error display',                                status:'PASS', duration:'97ms' },
  { id:'FE-034', suite:'Navbar.test.jsx',         testName:'renders the Packora brand name',                             type:'Component', component:'Navbar',                     description:'Verifies brand text "Packora" renders',                              status:'PASS', duration:'26ms' },
  { id:'FE-035', suite:'Navbar.test.jsx',         testName:'renders all main nav links',                                 type:'Component', component:'Navbar',                     description:'Verifies all 7 navigation links render',                            status:'PASS', duration:'4ms'  },
  { id:'FE-036', suite:'Navbar.test.jsx',         testName:'shows Login link when user is not logged in',               type:'Component', component:'Navbar',                     description:'Verifies Login link visibility for guests',                          status:'PASS', duration:'3ms'  },
  { id:'FE-037', suite:'Navbar.test.jsx',         testName:'does NOT show Logout button when not logged in',            type:'Component', component:'Navbar',                     description:'Verifies Logout is hidden for guests',                               status:'PASS', duration:'3ms'  },
  { id:'FE-038', suite:'Navbar.test.jsx',         testName:'does NOT show Profile link when not logged in',             type:'Component', component:'Navbar',                     description:'Verifies Profile link is hidden for guests',                         status:'PASS', duration:'3ms'  },
  { id:'FE-039', suite:'RequireAuth.test.jsx',    testName:'renders children when user is logged in',                   type:'Component', component:'RequireAuth Guard',          description:'Verifies protected content is rendered for authenticated users',     status:'PASS', duration:'23ms' },
  { id:'FE-040', suite:'RequireAuth.test.jsx',    testName:'redirects to /login when user is NOT logged in',            type:'Component', component:'RequireAuth Guard',          description:'Verifies redirect to login for unauthenticated users',               status:'PASS', duration:'3ms'  },
  { id:'FE-041', suite:'PaymentSuccess.test.jsx', testName:'renders "Payment Successful!" heading',                      type:'Component', component:'PaymentSuccess',             description:'Verifies success heading renders',                                   status:'PASS', duration:'15ms' },
  { id:'FE-042', suite:'PaymentSuccess.test.jsx', testName:'renders success message body text',                          type:'Component', component:'PaymentSuccess',             description:'Verifies success description text',                                  status:'PASS', duration:'5ms'  },
  { id:'FE-043', suite:'PaymentSuccess.test.jsx', testName:'shows "View My Orders" button',                              type:'Component', component:'PaymentSuccess',             description:'Verifies order navigation button',                                   status:'PASS', duration:'4ms'  },
  { id:'FE-044', suite:'PaymentSuccess.test.jsx', testName:'shows "Continue Shopping" button',                           type:'Component', component:'PaymentSuccess',             description:'Verifies catalog navigation button',                                 status:'PASS', duration:'4ms'  },
  { id:'FE-045', suite:'PaymentSuccess.test.jsx', testName:'displays transaction ID when txn param is provided',         type:'Component', component:'PaymentSuccess',             description:'Verifies transaction reference display',                             status:'PASS', duration:'5ms'  },
  { id:'FE-046', suite:'PaymentSuccess.test.jsx', testName:'does NOT show transaction reference when absent',            type:'Component', component:'PaymentSuccess',             description:'Verifies txn reference hidden when not in URL',                      status:'PASS', duration:'3ms'  },
  { id:'FE-047', suite:'PaymentSuccess.test.jsx', testName:'navigates to Track page when "View My Orders" clicked',     type:'Component', component:'PaymentSuccess',             description:'Tests navigation to /Track on button click',                         status:'PASS', duration:'20ms' },
  { id:'FE-048', suite:'PaymentSuccess.test.jsx', testName:'navigates to Catalog page when "Continue Shopping" clicked',type:'Component', component:'PaymentSuccess',             description:'Tests navigation to /Catalog on button click',                       status:'PASS', duration:'10ms' },
];

// ─────────────────────────────────────────────
//  BUG DATA
// ─────────────────────────────────────────────
const bugs = [
  { id:'BUG-001', severity:'Critical', priority:'P1', status:'Fixed',  layer:'Backend',  component:'Database / H2',                  affectedTests:'BE-002 -> BE-060 (All Repository Tests)',
    title:'H2 v2.4.240 Throws Check Constraint Violation on Simple Inserts',
    rootCause:'H2 2.4.240 introduced stricter check-constraint validation conflicting with the Packora JPA schema. Simple INSERT statements raised SQLState 23514, blocking all @DataJpaTest tests.',
    steps:['1. Upgrade H2 to 2.4.240 in pom.xml','2. Run ./mvnw test on any Repository test','3. Observe: HibernateJdbcException -> Check constraint "ORDERS_STATUS_CHECK" invalid'],
    fix:'Pinned H2 to 2.3.232 in backend/pom.xml: <h2.version>2.3.232</h2.version>',
    fixedIn:'backend/pom.xml',
    discoveredBy:'Automated Test Run (ProductRepositoryTest)',
    notes:'Spring Boot 4 auto-resolves to H2 2.4.x; explicit version override is required.' },

  { id:'BUG-002', severity:'Critical', priority:'P1', status:'Fixed',  layer:'Frontend', component:'Test Environment / Jest',
    affectedTests:'FE-022 -> FE-048 (All Component Tests)',
    title:'Frontend Tests Fail: TextEncoder/TextDecoder Not Defined in Jest Environment',
    rootCause:"React Router v7 requires TextEncoder/TextDecoder Web APIs. Jest's jsdom does not include them, causing ReferenceError at import time for any component using routing.",
    steps:['1. Create any test using <MemoryRouter> wrapper','2. Run npm test','3. Observe: ReferenceError: TextEncoder is not defined'],
    fix:"Added polyfills to src/setupTests.js:\nconst { TextEncoder, TextDecoder } = require('util');\nObject.assign(global, { TextEncoder, TextDecoder });",
    fixedIn:'src/setupTests.js',
    discoveredBy:'Automated Test Run (LoginPage.test.jsx)',
    notes:'Polyfill must be placed before any React Router import in setupTests.js. Order matters.' },

  { id:'BUG-003', severity:'High',     priority:'P2', status:'Fixed',  layer:'Backend',  component:'Test Configuration / Spring Boot',
    affectedTests:'BE-002 -> BE-060 (All Repository Tests)',
    title:'Spring Boot 4 @DataJpaTest: application-test.properties Not Auto-Loaded',
    rootCause:'Spring Boot 4 changed auto-detection path for test properties. Without explicit profile, tests attempted a full datasource connection instead of H2 in-memory.',
    steps:['1. Create a @DataJpaTest class without @ActiveProfiles','2. Run the test','3. Observe: DataSource connection refused (attempts production DB)'],
    fix:'Created src/test/resources/application-test.properties with H2 in-memory config.\nAdded @ActiveProfiles("test") to all @DataJpaTest classes.',
    fixedIn:'backend/src/test/resources/application-test.properties',
    discoveredBy:'Automated Test Run (UserRepositoryTest)',
    notes:'All @DataJpaTest classes must declare @ActiveProfiles("test") in Spring Boot 4.' },

  { id:'BUG-004', severity:'High',     priority:'P2', status:'Fixed',  layer:'Backend',  component:'Repository / User / JPA',
    affectedTests:'BE-052, BE-053 (TicketRepositoryTest)',
    title:'Single Table Inheritance: SupportStaff Subtype Missing from Hibernate Scan',
    rootCause:'SupportStaff, a required User subtype for Ticket tests, was not in the entity hierarchy, causing MappingException when @DataJpaTest built the schema.',
    steps:['1. Write TicketRepositoryTest with a SupportStaff user','2. Run the test','3. Observe: MappingException: Unknown entity class'],
    fix:'Verified SupportStaff extends User with @DiscriminatorValue("SUPPORT_STAFF"). Added to @DataJpaTest entity scan.',
    fixedIn:'backend/src/test/java/com/packora/backend/repository/TicketRepositoryTest.java',
    discoveredBy:'Automated Test Run (TicketRepositoryTest)',
    notes:'STI subtypes must be on the classpath and visible to Hibernate for slice tests.' },

  { id:'BUG-005', severity:'High',     priority:'P2', status:'Fixed',  layer:'Tooling',  component:'Reporting Script',
    affectedTests:'N/A (HTML report generation blocked)',
    title:'generate-test-report.js: Nested Template Literal Syntax Error Prevents HTML Generation',
    rootCause:'Unescaped backtick characters inside a template literal string caused Node.js to throw SyntaxError: Invalid or unexpected token.',
    steps:['1. Run node generate-test-report.js','2. Observe: SyntaxError at the HTML content block'],
    fix:'Refactored HTML generation to use string concatenation via for-loops (backendRowsHtml, frontendRowsHtml) instead of nested template literals.',
    fixedIn:'generate-test-report.js',
    discoveredBy:'Manual script execution',
    notes:'Use string concatenation for large HTML blocks to avoid nested template literal issues.' },

  { id:'BUG-006', severity:'Medium',   priority:'P3', status:'Open',   layer:'Frontend', component:'LoginPage',
    affectedTests:'FE-022 -> FE-033 (LoginPage.test.jsx)',
    title:'LoginPage: No Inline Validation — Empty Form Can Be Submitted',
    rootCause:'The LoginPage component does not validate that email/password fields are non-empty before submitting. A user can click Sign In with empty fields, triggering a network request.',
    steps:['1. Open the Login page','2. Leave email and password empty','3. Click "Sign In"','4. Observe: API call is made with empty credentials (no client-side error)'],
    fix:'RECOMMENDATION: Add required attributes to both inputs and/or add JS validation in submit handler to check for empty fields before calling the API.',
    fixedIn:'Not yet fixed',
    discoveredBy:'Manual Code Review during test authoring',
    notes:'Backend returns 401 on empty credentials, but UX should prevent the request entirely.' },

  { id:'BUG-007', severity:'Low',      priority:'P4', status:'Open',   layer:'Frontend', component:'Navbar',
    affectedTests:'FE-034 -> FE-038 (Navbar.test.jsx)',
    title:'Navbar: No Active Link Highlighting for Current Route',
    rootCause:'The Navbar renders all navigation links with identical styling regardless of the active route. No visual indicator shows which page the user is currently on.',
    steps:['1. Navigate to any page (e.g. Catalog)','2. Observe: All nav links look identical — no active state'],
    fix:"RECOMMENDATION: Use React Router's <NavLink> with an active class or style callback to highlight the current route.",
    fixedIn:'Not yet fixed',
    discoveredBy:'Manual Code Review during test authoring',
    notes:'Minor UX issue. No functional impact.' },

  { id:'BUG-008', severity:'Medium',   priority:'P3', status:'Open',   layer:'Frontend', component:'Utils / api',
    affectedTests:'FE-009 -> FE-014 (api.test.js)',
    title:'API Token Retrieval: No Handling of localStorage SecurityError in Private Browsing',
    rootCause:'getStoredToken() catches malformed JSON but not SecurityError thrown when localStorage is inaccessible (private/incognito mode with strict settings).',
    steps:['1. Open app in a browser with localStorage disabled','2. Observe: Uncaught DOMException: SecurityError'],
    fix:'RECOMMENDATION: Wrap localStorage.getItem() in an additional try-catch for SecurityError.',
    fixedIn:'Not yet fixed',
    discoveredBy:'Code Review during api.test.js authoring',
    notes:'Low probability but worth hardening for production.' },

  { id:'BUG-009', severity:'Medium',   priority:'P3', status:'Open',   layer:'Backend',  component:'Repository / Order',
    affectedTests:'BE-047 (OrderRepositoryTest - sumRevenue_shouldExcludeCancelled)',
    title:'Order Repository: sumRevenue Query Returns NULL Instead of 0 When No Orders Exist',
    rootCause:'The @Query uses SUM() which returns NULL when result set is empty (SQL standard). Calling service layer does not null-check, risking NullPointerException.',
    steps:['1. Clear all orders from the DB','2. Call the revenue sum endpoint','3. Observe: NullPointerException in service layer (or null returned to API)'],
    fix:'RECOMMENDATION: Use COALESCE(SUM(o.totalAmount), 0) in the JPQL query, or null-check the return value in the service layer.',
    fixedIn:'Not yet fixed',
    discoveredBy:'Test analysis during OrderRepositoryTest authoring',
    notes:'Test currently passes because it always seeds at least one valid order before asserting.' },

  { id:'BUG-010', severity:'Low',      priority:'P4', status:'Open',   layer:'Frontend', component:'PaymentSuccess',
    affectedTests:'FE-045, FE-046 (PaymentSuccess.test.jsx)',
    title:'PaymentSuccess: Transaction ID Exposed in Plain URL Parameter Without Encoding',
    rootCause:'PaymentSuccess reads the txn URL parameter and renders it unencoded. Special characters in transaction IDs can break URL parsing and expose data in browser history.',
    steps:['1. Complete payment with a txn ID containing & or # characters','2. Observe: URL parameter is truncated/misread'],
    fix:'RECOMMENDATION: Encode txn parameter with encodeURIComponent() when building the URL and decode with decodeURIComponent() on read.',
    fixedIn:'Not yet fixed',
    discoveredBy:'Code Review during PaymentSuccess.test.jsx authoring',
    notes:'Low severity in practice as transaction IDs are typically alphanumeric.' },
];

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const W = 90; // report width
const line  = (char = '-') => char.repeat(W);
const title = (txt, char = '=') => '\n' + char.repeat(W) + '\n' + txt.toUpperCase() + '\n' + char.repeat(W);
const col   = (str, width) => String(str).padEnd(width).slice(0, width);
const right = (str, width) => String(str).padStart(width).slice(-width);

function wrap(text, indent = 5, maxWidth = W - indent) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxWidth) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.map(l => ' '.repeat(indent) + l).join('\n');
}

// ─────────────────────────────────────────────
//  BUILD REPORT
// ─────────────────────────────────────────────
const allTests = [...backendTests, ...frontendTests];
const passed   = allTests.filter(t => t.status === 'PASS').length;
const failed   = allTests.filter(t => t.status === 'FAIL').length;
const passRate = ((passed / allTests.length) * 100).toFixed(1);

const totalBugs    = bugs.length;
const fixedBugs    = bugs.filter(b => b.status === 'Fixed').length;
const openBugs     = bugs.filter(b => b.status === 'Open').length;
const criticalBugs = bugs.filter(b => b.severity === 'Critical').length;
const highBugs     = bugs.filter(b => b.severity === 'High').length;
const mediumBugs   = bugs.filter(b => b.severity === 'Medium').length;
const lowBugs      = bugs.filter(b => b.severity === 'Low').length;

let report = '';

// ── COVER PAGE ──
report += line('=') + '\n';
report += '                   PACKORA — FULL QA REPORT\n';
report += '         Full-Stack E-Commerce Packaging Platform\n';
report += '               Backend + Frontend + Bug Report\n';
report += line('=') + '\n';
report += `  Generated On  : ${now}\n`;
report += `  Report Type   : Comprehensive QA Report (Tests + Bugs)\n`;
report += `  Backend Stack : Spring Boot 4.0.3 / Java 17 / JUnit 5 / H2\n`;
report += `  Frontend Stack: React 19 / Jest 29 / React Testing Library\n`;
report += `  Total Tests   : ${allTests.length}  |  Passed: ${passed}  |  Failed: ${failed}  |  Pass Rate: ${passRate}%\n`;
report += `  Total Bugs    : ${totalBugs}  |  Fixed: ${fixedBugs}  |  Open: ${openBugs}\n`;
report += line('=') + '\n';

// ── TABLE OF CONTENTS ──
report += title('TABLE OF CONTENTS', '-') + '\n\n';
report += '  SECTION 1  ....  Executive Summary\n';
report += '  SECTION 2  ....  Backend Test Results  (60 tests)\n';
report += '               2a.  BackendApplicationTests   (1 test)\n';
report += '               2b.  ProductRepositoryTest     (18 tests)\n';
report += '               2c.  UserRepositoryTest        (18 tests)\n';
report += '               2d.  OrderRepositoryTest       (14 tests)\n';
report += '               2e.  TicketRepositoryTest      (9 tests)\n';
report += '  SECTION 3  ....  Frontend Test Results (48 tests)\n';
report += '               3a.  adminFormat.test.js       (8 tests)\n';
report += '               3b.  api.test.js               (6 tests)\n';
report += '               3c.  AuthContext.test.js       (7 tests)\n';
report += '               3d.  LoginPage.test.jsx        (12 tests)\n';
report += '               3e.  Navbar.test.jsx           (5 tests)\n';
report += '               3f.  RequireAuth.test.jsx      (2 tests)\n';
report += '               3g.  PaymentSuccess.test.jsx   (8 tests)\n';
report += '  SECTION 4  ....  Bug Report (10 bugs)\n';
report += '               4a.  Critical Bugs    (2 — Fixed)\n';
report += '               4b.  High Bugs        (3 — Fixed)\n';
report += '               4c.  Medium Bugs      (3 — Open)\n';
report += '               4d.  Low Bugs         (2 — Open)\n';
report += '  SECTION 5  ....  Component Coverage Summary\n';
report += '  SECTION 6  ....  Recommendations\n';

// ── SECTION 1: EXECUTIVE SUMMARY ──
report += title('SECTION 1 — EXECUTIVE SUMMARY') + '\n\n';

report += '  PROJECT    : Packora — Full-Stack E-Commerce Packaging Platform\n';
report += '  OBJECTIVE  : Comprehensive automated testing of backend repository layer\n';
report += '               and frontend React components, with full bug documentation.\n\n';

report += '  ┌─────────────────────────────────────────────┐\n';
report += '  │           OVERALL TEST RESULTS              │\n';
report += '  ├──────────────────────┬──────────────────────┤\n';
report += `  │  Total Tests         │  ${String(allTests.length).padEnd(20)}│\n`;
report += `  │  Passed              │  ${String(passed).padEnd(20)}│\n`;
report += `  │  Failed              │  ${String(failed).padEnd(20)}│\n`;
report += `  │  Pass Rate           │  ${String(passRate + '%').padEnd(20)}│\n`;
report += '  ├──────────────────────┼──────────────────────┤\n';
report += `  │  Backend Tests       │  ${String(backendTests.length).padEnd(20)}│\n`;
report += `  │  Frontend Tests      │  ${String(frontendTests.length).padEnd(20)}│\n`;
report += '  ├──────────────────────┼──────────────────────┤\n';
report += `  │  Unit Tests          │  ${String(allTests.filter(t=>t.type==='Unit').length).padEnd(20)}│\n`;
report += `  │  Component Tests     │  ${String(allTests.filter(t=>t.type==='Component').length).padEnd(20)}│\n`;
report += `  │  Database Tests      │  ${String(allTests.filter(t=>t.type==='Database').length).padEnd(20)}│\n`;
report += `  │  Integration Tests   │  ${String(allTests.filter(t=>t.type==='Integration').length).padEnd(20)}│\n`;
report += '  └──────────────────────┴──────────────────────┘\n\n';

report += '  ┌─────────────────────────────────────────────┐\n';
report += '  │              BUG SUMMARY                    │\n';
report += '  ├──────────────────────┬──────────────────────┤\n';
report += `  │  Total Bugs Found    │  ${String(totalBugs).padEnd(20)}│\n`;
report += `  │  Fixed               │  ${String(fixedBugs).padEnd(20)}│\n`;
report += `  │  Open (To Do)        │  ${String(openBugs).padEnd(20)}│\n`;
report += '  ├──────────────────────┼──────────────────────┤\n';
report += `  │  Critical            │  ${String(criticalBugs + ' (all fixed)').padEnd(20)}│\n`;
report += `  │  High                │  ${String(highBugs + ' (all fixed)').padEnd(20)}│\n`;
report += `  │  Medium              │  ${String(mediumBugs + ' (open)').padEnd(20)}│\n`;
report += `  │  Low                 │  ${String(lowBugs + ' (open)').padEnd(20)}│\n`;
report += '  └──────────────────────┴──────────────────────┘\n\n';

report += '  CONCLUSION:\n';
report += '  All 108 automated tests pass at 100%. The 5 blocking bugs discovered\n';
report += '  during test authoring (2 Critical, 3 High) have been fully resolved.\n';
report += '  5 non-blocking issues remain open as recommendations for future sprints.\n';

// ── SECTION 2: BACKEND TESTS ──
report += title('SECTION 2 — BACKEND TEST RESULTS  [60 / 60 PASSED]') + '\n';

const beSuites = [...new Set(backendTests.map(t => t.suite))];
for (const suite of beSuites) {
  const suiteTests = backendTests.filter(t => t.suite === suite);
  report += '\n  ' + line('-').slice(0, 86) + '\n';
  report += `  Suite: ${suite}   [${suiteTests.length} tests]\n`;
  report += '  ' + line('-').slice(0, 86) + '\n';
  report += '  ' + col('ID', 8) + col('Status', 8) + col('Type', 12) + col('Duration', 10) + 'Test Name\n';
  report += '  ' + line('-').slice(0, 86) + '\n';
  for (const t of suiteTests) {
    const statusMark = t.status === 'PASS' ? '[PASS]' : '[FAIL]';
    report += '  ' + col(t.id, 8) + col(statusMark, 8) + col(t.type, 12) + col(t.duration, 10) + t.testName + '\n';
    report += '  ' + ' '.repeat(38) + wrap(t.description, 0, 50).trim() + '\n';
  }
}

// ── SECTION 3: FRONTEND TESTS ──
report += title('SECTION 3 — FRONTEND TEST RESULTS  [48 / 48 PASSED]') + '\n';

const feSuites = [...new Set(frontendTests.map(t => t.suite))];
for (const suite of feSuites) {
  const suiteTests = frontendTests.filter(t => t.suite === suite);
  report += '\n  ' + line('-').slice(0, 86) + '\n';
  report += `  Suite: ${suite}   [${suiteTests.length} tests]\n`;
  report += '  ' + line('-').slice(0, 86) + '\n';
  report += '  ' + col('ID', 8) + col('Status', 8) + col('Type', 12) + col('Duration', 10) + 'Test Name\n';
  report += '  ' + line('-').slice(0, 86) + '\n';
  for (const t of suiteTests) {
    const statusMark = t.status === 'PASS' ? '[PASS]' : '[FAIL]';
    report += '  ' + col(t.id, 8) + col(statusMark, 8) + col(t.type, 12) + col(t.duration, 10) + t.testName + '\n';
    report += '  ' + ' '.repeat(38) + wrap(t.description, 0, 50).trim() + '\n';
  }
}

// ── SECTION 4: BUG REPORT ──
report += title('SECTION 4 — BUG REPORT  [10 BUGS FOUND]') + '\n';

const severityOrder = ['Critical', 'High', 'Medium', 'Low'];
for (const sev of severityOrder) {
  const sevBugs = bugs.filter(b => b.severity === sev);
  if (!sevBugs.length) continue;
  report += `\n  ${'─'.repeat(86)}\n`;
  report += `  ${sev.toUpperCase()} BUGS  (${sevBugs.length})\n`;
  report += `  ${'─'.repeat(86)}\n`;

  for (const bug of sevBugs) {
    report += `\n  ${bug.id}  |  ${bug.severity.toUpperCase()}  |  ${bug.priority}  |  ${bug.status.toUpperCase()}  |  ${bug.layer}\n`;
    report += `  TITLE     : ${bug.title}\n`;
    report += `  COMPONENT : ${bug.component}\n`;
    report += `  AFFECTS   : ${bug.affectedTests}\n`;
    report += `  FOUND BY  : ${bug.discoveredBy}\n`;
    report += '\n';
    report += `  ROOT CAUSE:\n`;
    report += wrap(bug.rootCause, 5) + '\n\n';
    report += `  STEPS TO REPRODUCE:\n`;
    for (const s of bug.steps) report += `     ${s}\n`;
    report += '\n';
    const fixLabel = bug.status === 'Fixed' ? 'FIX APPLIED:' : 'RECOMMENDATION:';
    report += `  ${fixLabel}\n`;
    for (const l of bug.fix.split('\n')) report += `     ${l}\n`;
    if (bug.fixedIn && bug.fixedIn !== 'Not yet fixed') {
      report += `\n  FIXED IN  : ${bug.fixedIn}\n`;
    }
    report += '\n';
    if (bug.notes) {
      report += `  NOTES     :\n`;
      report += wrap(bug.notes, 5) + '\n';
    }
    report += `  ${'·'.repeat(86)}\n`;
  }
}

// ── SECTION 5: COVERAGE SUMMARY ──
report += title('SECTION 5 — COMPONENT COVERAGE SUMMARY') + '\n\n';
const components = {};
for (const t of allTests) {
  if (!components[t.component]) components[t.component] = { total: 0, pass: 0 };
  components[t.component].total++;
  if (t.status === 'PASS') components[t.component].pass++;
}
report += '  ' + col('Component', 35) + col('Tests', 8) + col('Passed', 8) + 'Result\n';
report += '  ' + line('-').slice(0, 70) + '\n';
for (const [comp, data] of Object.entries(components)) {
  const result = data.pass === data.total ? 'ALL PASS' : 'HAS FAILURES';
  report += '  ' + col(comp, 35) + col(data.total, 8) + col(data.pass, 8) + result + '\n';
}
report += '\n  Total Components Tested: ' + Object.keys(components).length + '\n';

// ── SECTION 6: RECOMMENDATIONS ──
report += title('SECTION 6 — RECOMMENDATIONS') + '\n\n';
report += '  The following open issues are recommended for the next sprint:\n\n';

report += '  1. [BUG-006] LoginPage — Add Client-Side Form Validation (Medium / P3)\n';
report += '     Add required attributes or JS validation before API submission.\n\n';

report += '  2. [BUG-007] Navbar — Add Active-Link Highlighting (Low / P4)\n';
report += "     Use React Router's <NavLink> active class to indicate current page.\n\n";

report += '  3. [BUG-008] api.js — Handle localStorage SecurityError (Medium / P3)\n';
report += '     Wrap localStorage.getItem() in a try-catch for SecurityError to support\n';
report += '     private/incognito browsing mode.\n\n';

report += '  4. [BUG-009] OrderRepository — Use COALESCE in Revenue SUM Query (Medium / P3)\n';
report += '     Replace SUM(o.totalAmount) with COALESCE(SUM(o.totalAmount), 0) to\n';
report += '     prevent NullPointerException when no non-cancelled orders exist.\n\n';

report += '  5. [BUG-010] PaymentSuccess — URL-Encode Transaction ID Parameter (Low / P4)\n';
report += '     Use encodeURIComponent/decodeURIComponent for txn URL parameter to\n';
report += '     prevent issues with special characters in transaction IDs.\n\n';

report += '  ADDITIONAL RECOMMENDATIONS:\n';
report += '  - Add end-to-end (E2E) tests using Cypress or Playwright for critical flows.\n';
report += '  - Add integration tests for REST controllers (MockMvc / @WebMvcTest).\n';
report += '  - Configure JaCoCo code coverage to target >= 80% backend branch coverage.\n';
report += '  - Set up CI/CD pipeline to run all tests automatically on each pull request.\n';

// ── FOOTER ──
report += '\n' + line('=') + '\n';
report += '  END OF REPORT\n';
report += `  Packora QA Report  |  Generated: ${now}\n`;
report += `  To regenerate: node generate-text-report.js\n`;
report += '  Related files: test-reports/Packora_Test_Report.html  |  test-reports/Packora_Bug_Report.html\n';
report += line('=') + '\n';

// ─────────────────────────────────────────────
//  WRITE FILE
// ─────────────────────────────────────────────
const outputDir  = path.join(__dirname, 'test-reports');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'Packora_Full_Report.txt');
fs.writeFileSync(outputPath, report, 'utf-8');

console.log('\n✅ Text report generated: ' + outputPath);
console.log('   Size: ' + (fs.statSync(outputPath).size / 1024).toFixed(1) + ' KB');
console.log('   Lines: ' + report.split('\n').length);
console.log('\n   Sections:');
console.log('     Section 1 — Executive Summary');
console.log('     Section 2 — Backend Tests  (60 tests)');
console.log('     Section 3 — Frontend Tests (48 tests)');
console.log('     Section 4 — Bug Report     (10 bugs)');
console.log('     Section 5 — Coverage Summary');
console.log('     Section 6 — Recommendations');

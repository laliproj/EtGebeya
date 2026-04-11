// ─── Main Component ──────────────────────────────────────────────────────────
const UserReportsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchReports = async () => {
      try {
        const data = await adminService.getMyReports();
        setReports(data);
      } catch (err) {
        toast.error('ሪፖርቶችን ማምጣት አልተሳካም: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [isAuthenticated, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-warning-50 dark:bg-warning-900/20 rounded-xl flex items-center justify-center text-warning-600">
              <HiOutlineFlag className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              የእኔ ሪፖርቶች
            </h1>
          </div>
          <p className="text-surface-500 pl-0.5 ml-12 text-sm">My Submitted Reports — Track the status of your reports</p>
        </div>
        <Link
          to="/products"
          className="text-sm text-primary-600 hover:underline font-medium"
        >
          ወደ ምርቶች ሂድ →
        </Link>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl flex gap-3">
        <HiOutlineExclamationTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">ሪፖርቶቹ ሂደት</p>
          <p>ሪፖርቶቹ የEtGebeya ቡድን ከፈተሸ በኋላ ሁኔታ ይቀይሳሉ። Reports are reviewed by our team and the status will be updated once resolved. False reports may lead to account suspension.</p>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-16 text-center">
          <HiOutlineFlag className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">ምንም ሪፖርቶች የላቸዎትም</h3>
          <p className="text-surface-500 text-sm mb-6">You haven't submitted any reports yet.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
            ምርቶችን ይዳስሱ — Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-warning-50 dark:bg-warning-900/20 rounded-xl flex items-center justify-center text-warning-600 shrink-0 mt-0.5">
                    <HiOutlineFlag className="w-4 h-4" />

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

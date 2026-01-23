        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AITrendingProducts;

// 
// 
// 
// import { useEffect, useState } from 'react';
import { HiOutlineFire, HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';
import Skeleton from '../common/Skeleton';
import { useNavigate } from 'react-router-dom';

const AITrendingProducts = () => {
  const [data, setData] = useState({ searches: [], products: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get('/ai/trending.php');
        if (response.data?.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch trending', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="w-48 h-8 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (!data.products.length) return null;


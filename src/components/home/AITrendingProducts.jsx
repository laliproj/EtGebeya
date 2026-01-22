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

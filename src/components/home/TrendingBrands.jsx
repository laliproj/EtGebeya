import { Link } from 'react-router-dom';
import brandsData from '../../data/brands.json';

const TrendingBrands = () => {
  // Extract top brands across categories
  const allBrands = Object.values(brandsData).flat();
  const uniqueBrands = Array.from(new Set(allBrands.map(b => b.name)))
    .map(name => allBrands.find(b => b.name === name))
    .filter(b => b.name !== 'Generic')

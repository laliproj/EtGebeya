          <Skeleton className="w-48 h-8 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  const getTitle = () => {
    switch (strategy) {
      case 'personalized': return 'Recommended for You';
      case 'wishlist': return 'Based on Your Wishlist';
      default: return 'Trending Near You';

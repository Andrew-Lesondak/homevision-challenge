import { useGetHouses } from '../api/useGetHouses';
import HousesTable from './HousesTable';

function HouseListingPage() {
  const { data, isFetching, isLoading, fetchNextPage } = useGetHouses([
    'get-houses',
  ]);

  return (
    // <div className="m-auto">
    <div className="flex flex-col">
      <img className="w-auto p-12" src="../src/assets/homevision_logo.png"></img>
      <HousesTable
        data={data}
        fetchNextPage={fetchNextPage}
        isFetching={isFetching}
        isLoading={isLoading}
      />
    </div>
  );
}

export default HouseListingPage;

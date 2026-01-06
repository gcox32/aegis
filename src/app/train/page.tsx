import { getTrainPageData } from './actions';
import TrainPageClient from './TrainPageClient';

export default async function TrainPage() {
  const data = await getTrainPageData();

  if ('error' in data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">{data.error}</p>
      </div>
    );
  }

  return <TrainPageClient data={data} />;
}

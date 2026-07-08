import { Collection } from '../models/Collection.js';
import { KBDocument } from '../models/KBDocument.js';

export async function listCollections() {
  const collections = await Collection.find().sort({ createdAt: -1 }).lean();
  const counts = await KBDocument.aggregate([
    { $group: { _id: '$collectionId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count as number]));

  return collections.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    description: c.description,
    documentCount: countMap.get(c._id.toString()) ?? 0,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function createCollection(
  name: string,
  description: string,
  userId: string,
) {
  const col = await Collection.create({ name, description, createdBy: userId });
  return {
    id: col.id,
    name: col.name,
    description: col.description,
    documentCount: 0,
    createdAt: col.createdAt.toISOString(),
  };
}

import { pocketbase } from "@/lib/pocketbase";

export interface Album {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  caption: string | null;
  file_path: string;
  public_url: string;
  created_at: string;
}

interface AlbumRecord {
  id: string;
  name: string;
  description?: string;
  created: string;
}

interface PhotoRecord {
  id: string;
  album: string;
  caption?: string;
  image: string;
  created: string;
}

function requirePocketBase() {
  if (!pocketbase) {
    throw new Error("PocketBase is not configured.");
  }
  return pocketbase;
}

function mapAlbum(record: AlbumRecord): Album {
  return {
    id: record.id,
    name: record.name,
    description: record.description?.trim() || null,
    created_at: record.created,
  };
}

function mapPhoto(client: ReturnType<typeof requirePocketBase>, record: PhotoRecord): Photo {
  return {
    id: record.id,
    album_id: record.album,
    caption: record.caption?.trim() || null,
    file_path: record.image,
    public_url: client.files.getUrl(record, record.image),
    created_at: record.created,
  };
}

export async function fetchAlbums(): Promise<Album[]> {
  const client = requirePocketBase();
  const records = await client.collection("albums").getFullList<AlbumRecord>({
    sort: "-created",
  });

  return records.map(mapAlbum);
}

export async function createAlbum(input: {
  name: string;
  description?: string;
}): Promise<Album> {
  const client = requirePocketBase();
  const record = await client.collection("albums").create<AlbumRecord>({
    name: input.name,
    description: input.description?.trim() || "",
  });

  return mapAlbum(record);
}

export async function fetchPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const client = requirePocketBase();
  const records = await client.collection("photos").getFullList<PhotoRecord>({
    filter: `album = "${albumId}"`,
    sort: "-created",
  });

  return records.map((record) => mapPhoto(client, record));
}

export async function uploadPhoto(input: {
  albumId: string;
  file: File;
  caption?: string;
}): Promise<Photo> {
  const client = requirePocketBase();
  const formData = new FormData();

  formData.append("album", input.albumId);
  formData.append("caption", input.caption?.trim() || "");
  formData.append("image", input.file);

  const record = await client.collection("photos").create<PhotoRecord>(formData);

  return mapPhoto(client, record);
}

export async function deletePhoto(input: {
  photoId: string;
}): Promise<void> {
  const client = requirePocketBase();
  await client.collection("photos").delete(input.photoId);
}

export async function deleteAlbum(albumId: string): Promise<void> {
  const client = requirePocketBase();
  const photos = await client.collection("photos").getFullList<PhotoRecord>({
    filter: `album = "${albumId}"`,
  });

  await Promise.all(
    photos.map((photo) => client.collection("photos").delete(photo.id))
  );

  await client.collection("albums").delete(albumId);
}

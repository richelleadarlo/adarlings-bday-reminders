import { supabase } from "@/lib/supabase";

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

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

export async function fetchAlbums(): Promise<Album[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("albums")
    .select("id, name, description, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createAlbum(input: {
  name: string;
  description?: string;
}): Promise<Album> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("albums")
    .insert({
      name: input.name,
      description: input.description?.trim() || null,
    })
    .select("id, name, description, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("photos")
    .select("id, album_id, caption, file_path, public_url, created_at")
    .eq("album_id", albumId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function uploadPhoto(input: {
  albumId: string;
  file: File;
  caption?: string;
}): Promise<Photo> {
  const client = requireSupabase();
  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${input.albumId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const storageResult = await client.storage
    .from("album-photos")
    .upload(filePath, input.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: input.file.type || undefined,
    });

  if (storageResult.error) {
    throw new Error(storageResult.error.message);
  }

  const { data: publicData } = client.storage
    .from("album-photos")
    .getPublicUrl(filePath);

  const { data, error } = await client
    .from("photos")
    .insert({
      album_id: input.albumId,
      caption: input.caption?.trim() || null,
      file_path: filePath,
      public_url: publicData.publicUrl,
    })
    .select("id, album_id, caption, file_path, public_url, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deletePhoto(input: {
  photoId: string;
  filePath: string;
}): Promise<void> {
  const client = requireSupabase();

  const storageResult = await client.storage
    .from("album-photos")
    .remove([input.filePath]);

  if (storageResult.error) {
    throw new Error(storageResult.error.message);
  }

  const { error } = await client
    .from("photos")
    .delete()
    .eq("id", input.photoId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAlbum(albumId: string): Promise<void> {
  const client = requireSupabase();

  const { data: photos, error: photosError } = await client
    .from("photos")
    .select("file_path")
    .eq("album_id", albumId);

  if (photosError) {
    throw new Error(photosError.message);
  }

  const filePaths = (photos ?? [])
    .map((photo) => photo.file_path)
    .filter(Boolean);

  if (filePaths.length > 0) {
    const storageResult = await client.storage
      .from("album-photos")
      .remove(filePaths);

    if (storageResult.error) {
      throw new Error(storageResult.error.message);
    }
  }

  const { error } = await client
    .from("albums")
    .delete()
    .eq("id", albumId);

  if (error) {
    throw new Error(error.message);
  }
}

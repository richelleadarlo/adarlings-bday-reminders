import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, FolderPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Album,
  createAlbum,
  deleteAlbum,
  deletePhoto,
  fetchAlbums,
  fetchPhotosByAlbum,
  uploadPhoto,
} from "@/lib/albums";
import { isPocketBaseConfigured } from "@/lib/pocketbase";

const AlbumSection = () => {
  const queryClient = useQueryClient();
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const albumsQuery = useQuery({
    queryKey: ["albums"],
    queryFn: fetchAlbums,
    enabled: isPocketBaseConfigured,
  });

  useEffect(() => {
    if (!albumsQuery.data || albumsQuery.data.length === 0) {
      setSelectedAlbumId(null);
      return;
    }

    if (!selectedAlbumId) {
      setSelectedAlbumId(albumsQuery.data[0].id);
      return;
    }

    const exists = albumsQuery.data.some((album) => album.id === selectedAlbumId);
    if (!exists) {
      setSelectedAlbumId(albumsQuery.data[0].id);
    }
  }, [albumsQuery.data, selectedAlbumId]);

  const selectedAlbum = useMemo(
    () => albumsQuery.data?.find((album) => album.id === selectedAlbumId) ?? null,
    [albumsQuery.data, selectedAlbumId]
  );

  const photosQuery = useQuery({
    queryKey: ["album-photos", selectedAlbumId],
    queryFn: () => fetchPhotosByAlbum(selectedAlbumId as string),
    enabled: isPocketBaseConfigured && Boolean(selectedAlbumId),
  });

  const createAlbumMutation = useMutation({
    mutationFn: createAlbum,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      setSelectedAlbumId(created.id);
      setAlbumName("");
      setAlbumDescription("");
      toast.success("Album created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create album.");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["album-photos", selectedAlbumId] });
      setCaption("");
      setFile(null);
      toast.success("Photo uploaded");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to upload photo.");
    },
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: deleteAlbum,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["albums"] });
      await queryClient.invalidateQueries({ queryKey: ["album-photos"] });
      setSelectedAlbumId(null);
      toast.success("Album deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete album.");
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["album-photos", selectedAlbumId] });
      toast.success("Photo deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete photo.");
    },
  });

  const onCreateAlbum = (e: FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) {
      return;
    }

    createAlbumMutation.mutate({
      name: albumName.trim(),
      description: albumDescription,
    });
  };

  const onUploadPhoto = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAlbumId || !file) {
      return;
    }

    uploadMutation.mutate({
      albumId: selectedAlbumId,
      file,
      caption,
    });
  };

  const onDeleteAlbum = (album: Album) => {
    const confirmed = window.confirm(
      `Delete album "${album.name}" and all of its photos? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    deleteAlbumMutation.mutate(album.id);
  };

  const onDeletePhoto = (photoId: string) => {
    const confirmed = window.confirm("Delete this photo? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    deletePhotoMutation.mutate({ photoId });
  };

  if (!isPocketBaseConfigured) {
    return (
      <div className="rounded-xl border border-card-blue-foreground/25 bg-card-blue-foreground/10 p-4 text-card-blue-foreground/85">
        <h3 className="text-xl font-display font-bold italic">Albums need backend setup</h3>
        <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body)" }}>
          Add VITE_POCKETBASE_URL in a .env file to enable shared albums and uploads.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border border-card-blue-foreground/25 bg-card-blue-foreground/10 p-4">
        <h3 className="text-xl font-display font-bold italic text-card-blue-foreground">Albums</h3>
        <form onSubmit={onCreateAlbum} className="mt-4 flex flex-col gap-2">
          <Input
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder="Album name"
            className="bg-card-blue-foreground/25 border-card-blue-foreground/40 text-card-blue-foreground placeholder:text-card-blue-foreground/50"
          />
          <Input
            value={albumDescription}
            onChange={(e) => setAlbumDescription(e.target.value)}
            placeholder="Description (optional)"
            className="bg-card-blue-foreground/25 border-card-blue-foreground/40 text-card-blue-foreground placeholder:text-card-blue-foreground/50"
          />
          <Button
            type="submit"
            disabled={createAlbumMutation.isPending || !albumName.trim()}
            className="bg-card-blue-foreground/20 text-card-blue-foreground hover:bg-card-blue-foreground/30 border border-card-blue-foreground/20"
          >
            <FolderPlus className="mr-1 h-4 w-4" />
            Create Album
          </Button>
        </form>

        <div className="mt-4 max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {albumsQuery.isLoading && (
            <p className="text-sm text-card-blue-foreground/60">Loading albums...</p>
          )}
          {!albumsQuery.isLoading && (albumsQuery.data?.length ?? 0) === 0 && (
            <p className="text-sm text-card-blue-foreground/60">Create your first album.</p>
          )}
          {albumsQuery.data?.map((album: Album) => (
            <div
              key={album.id}
              className={`flex items-start gap-2 rounded-lg px-3 py-2 transition-colors ${
                selectedAlbumId === album.id
                  ? "bg-card-blue-foreground/25 text-card-blue-foreground"
                  : "bg-card-blue-foreground/10 text-card-blue-foreground/80 hover:bg-card-blue-foreground/20"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedAlbumId(album.id)}
                className="min-w-0 flex-1 text-left"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <p className="font-semibold truncate">{album.name}</p>
                {album.description && (
                  <p className="text-xs opacity-75 truncate">{album.description}</p>
                )}
              </button>
              <button
                type="button"
                onClick={() => onDeleteAlbum(album)}
                disabled={deleteAlbumMutation.isPending}
                className="rounded-md p-1 text-card-blue-foreground/70 hover:bg-card-blue-foreground/15 hover:text-card-blue-foreground disabled:opacity-50"
                aria-label={`Delete ${album.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-xl border border-card-blue-foreground/25 bg-card-blue-foreground/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-display font-bold italic text-card-blue-foreground">
              {selectedAlbum ? selectedAlbum.name : "Select an album"}
            </h3>
            {selectedAlbum?.description && (
              <p className="mt-1 text-sm text-card-blue-foreground/70" style={{ fontFamily: "var(--font-body)" }}>
                {selectedAlbum.description}
              </p>
            )}
          </div>
          {selectedAlbum && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onDeleteAlbum(selectedAlbum)}
              disabled={deleteAlbumMutation.isPending}
              className="border-card-blue-foreground/30 bg-card-blue-foreground/10 text-card-blue-foreground hover:bg-card-blue-foreground/20"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Album
            </Button>
          )}
        </div>

        <form onSubmit={onUploadPhoto} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="bg-card-blue-foreground/25 border-card-blue-foreground/40 text-card-blue-foreground file:text-card-blue-foreground"
          />
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="bg-card-blue-foreground/25 border-card-blue-foreground/40 text-card-blue-foreground placeholder:text-card-blue-foreground/50"
          />
          <Button
            type="submit"
            disabled={!selectedAlbumId || !file || uploadMutation.isPending}
            className="bg-card-blue-foreground/20 text-card-blue-foreground hover:bg-card-blue-foreground/30 border border-card-blue-foreground/20"
          >
            <ImagePlus className="mr-1 h-4 w-4" />
            Upload
          </Button>
        </form>

        <div className="mt-5 max-h-[38vh] overflow-y-auto pr-1 custom-scrollbar">
          {photosQuery.isLoading && (
            <p className="text-sm text-card-blue-foreground/60">Loading photos...</p>
          )}
          {!photosQuery.isLoading && (photosQuery.data?.length ?? 0) === 0 && (
            <p className="text-sm text-card-blue-foreground/60">No photos in this album yet.</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photosQuery.data?.map((photo) => (
              <figure
                key={photo.id}
                className="group relative rounded-lg overflow-hidden border border-card-blue-foreground/30 bg-card-blue-foreground/15"
              >
                <img
                  src={photo.public_url}
                  alt={photo.caption || "Album photo"}
                  loading="lazy"
                  className="h-32 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onDeletePhoto(photo.id)}
                  disabled={deletePhotoMutation.isPending}
                  className="absolute right-2 top-2 rounded-full bg-[rgba(8,12,35,0.72)] p-1.5 text-card-blue-foreground opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50"
                  aria-label="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {photo.caption && (
                  <figcaption
                    className="px-2 py-1 text-xs text-card-blue-foreground/80 truncate"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlbumSection;

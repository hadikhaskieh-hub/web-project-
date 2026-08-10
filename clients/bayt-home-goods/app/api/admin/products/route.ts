import { requireStaff } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listCategories,
  updateProduct,
  uniqueProductSlug,
  type ProductInput,
} from "@/lib/db";
import { parseMoneyToCents } from "@/lib/money";
import { deleteProductPhoto, saveProductPhoto } from "@/lib/uploads";
import { toInt, trimmed } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create a product, or save an existing one. Sent as multipart form data. */
export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const form = await request.formData();

  const id = toInt(form.get("id"), 0);
  const existing = id > 0 ? getProductById(id) : undefined;

  if (id > 0 && !existing) {
    return Response.json({ message: "That product is gone." }, { status: 404 });
  }

  const name = trimmed(form.get("name"), 120);
  const priceRaw = trimmed(form.get("price"), 20);
  const compareRaw = trimmed(form.get("compare"), 20);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Give the product a name.";

  const price = parseMoneyToCents(priceRaw);
  if (price === null) errors.price = "Write the price as a number, like 24.50.";

  let compare: number | null = null;
  if (compareRaw) {
    compare = parseMoneyToCents(compareRaw);
    if (compare === null)
      errors.compare = "Write the old price as a number, or leave it blank.";
    else if (price !== null && compare <= price)
      errors.compare = "The old price needs to be higher than the price.";
  }

  const categoryId = toInt(form.get("category_id"), 0);
  const validCategory =
    categoryId > 0 &&
    listCategories().some((category) => category.id === categoryId);

  if (categoryId > 0 && !validCategory) errors.category_id = "Pick a shelf.";

  if (Object.keys(errors).length > 0) {
    return Response.json(
      { message: "Check the highlighted fields.", errors },
      { status: 400 },
    );
  }

  // Photo. An upload replaces whatever was there before.
  let imagePath = existing?.image_path ?? null;
  const photo = form.get("photo");
  const removePhoto = form.get("remove_photo") === "1";

  if (photo instanceof File && photo.size > 0) {
    const saved = await saveProductPhoto(photo);
    if (!saved.ok) {
      return Response.json(
        { message: saved.message, errors: { photo: saved.message } },
        { status: 400 },
      );
    }
    await deleteProductPhoto(imagePath);
    imagePath = saved.path;
  } else if (removePhoto) {
    await deleteProductPhoto(imagePath);
    imagePath = null;
  }

  const input: ProductInput = {
    name,
    summary: trimmed(form.get("summary"), 200),
    description: trimmed(form.get("description"), 4000),
    price_cents: price as number,
    compare_cents: compare,
    category_id: validCategory ? categoryId : null,
    image_path: imagePath,
    stock: Math.max(0, toInt(form.get("stock"), 0)),
    featured: form.get("featured") === "1" ? 1 : 0,
    active: form.get("active") === "1" ? 1 : 0,
  };

  if (existing) {
    updateProduct(existing.id, input);
    return Response.json({ ok: true, id: existing.id });
  }

  const newId = createProduct({ ...input, slug: uniqueProductSlug(name) });

  return Response.json({ ok: true, id: newId }, { status: 201 });
}

/** Delete a product and its photo. Past orders keep their own copy. */
export async function DELETE(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const id = toInt(new URL(request.url).searchParams.get("id"), 0);
  const product = id > 0 ? getProductById(id) : undefined;

  if (!product) {
    return Response.json({ message: "That product is gone." }, { status: 404 });
  }

  await deleteProductPhoto(product.image_path);
  deleteProduct(product.id);

  return Response.json({ ok: true });
}

export function upsertAdminObjectByPublicId<
  TObject extends { publicId: string },
>(currentObjects: readonly TObject[], nextObject: TObject): TObject[] {
  if (
    currentObjects.some(
      (currentObject) => currentObject.publicId === nextObject.publicId,
    )
  ) {
    return currentObjects.map((currentObject) =>
      currentObject.publicId === nextObject.publicId
        ? nextObject
        : currentObject,
    );
  }

  return [nextObject, ...currentObjects];
}

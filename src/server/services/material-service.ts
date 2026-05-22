import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  MaterialDto,
  MaterialResultDto,
} from "../contracts/material-contract";
import {
  mapMaterialResultToApi,
  mapMaterialToApi,
} from "../mappers/material-mapper";
import type { MaterialRepository } from "../repositories/material-repository";
import type { ContentMutationContext } from "../repositories/question-repository";
import {
  normalizeCreateMaterialInput,
  normalizeMaterialListInput,
  normalizeUpdateMaterialInput,
} from "../validators/material";

export type MaterialService = {
  listMaterials(
    input?: Record<string, unknown>,
  ): Promise<ApiResponse<MaterialDto[] | null>>;
  createMaterial(
    input: unknown,
  ): Promise<ApiResponse<MaterialResultDto | null>>;
  getMaterial(publicId: string): Promise<ApiResponse<MaterialResultDto | null>>;
  updateMaterial(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<MaterialResultDto | null>>;
  disableMaterial(
    publicId: string,
  ): Promise<ApiResponse<MaterialResultDto | null>>;
  copyMaterial(
    publicId: string,
  ): Promise<ApiResponse<MaterialResultDto | null>>;
};

export type MaterialServiceOptions = {
  mutationContext?: ContentMutationContext;
};

const INVALID_MATERIAL_INPUT_CODE = 422201;
const MATERIAL_NOT_FOUND_CODE = 404201;
const MATERIAL_LOCKED_CODE = 409201;
const MATERIAL_RUNTIME_UNAVAILABLE_CODE = 503201;

function createInvalidMaterialInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    INVALID_MATERIAL_INPUT_CODE,
    "Invalid material input.",
  );
}

function createMaterialNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(
    MATERIAL_NOT_FOUND_CODE,
    "Material does not exist.",
  );
}

export function createMaterialService(
  materialRepository: MaterialRepository,
  options: MaterialServiceOptions = {},
): MaterialService {
  return {
    async listMaterials(input = {}) {
      const materialQuery = normalizeMaterialListInput(input);
      const materialList =
        await materialRepository.listMaterials(materialQuery);

      return createPaginatedResponse(
        materialList.rows.map((material) => mapMaterialToApi(material)),
        {
          page: materialQuery.page,
          pageSize: materialQuery.pageSize,
          total: materialList.total,
          sortBy: materialQuery.sortBy,
          sortOrder: materialQuery.sortOrder,
        },
      );
    },

    async createMaterial(input) {
      const materialInput = normalizeCreateMaterialInput(input);

      if (!materialInput.success) {
        return createInvalidMaterialInputResponse();
      }

      const material = await materialRepository.createMaterial(
        materialInput.value,
        options.mutationContext,
      );

      return createSuccessResponse(mapMaterialResultToApi(material));
    },

    async getMaterial(publicId) {
      const material =
        await materialRepository.findMaterialByPublicId(publicId);

      if (material === null) {
        return createMaterialNotFoundResponse();
      }

      return createSuccessResponse(mapMaterialResultToApi(material));
    },

    async updateMaterial(publicId, input) {
      const materialInput = normalizeUpdateMaterialInput(input);

      if (!materialInput.success) {
        return createInvalidMaterialInputResponse();
      }

      const material =
        await materialRepository.findMaterialByPublicId(publicId);

      if (material === null) {
        return createMaterialNotFoundResponse();
      }

      if (material.is_locked) {
        return createErrorResponse(
          MATERIAL_LOCKED_CODE,
          "Locked material cannot be edited.",
        );
      }

      const updatedMaterial = await materialRepository.updateMaterial(
        {
          publicId,
          ...materialInput.value,
        },
        options.mutationContext,
      );

      return createSuccessResponse(mapMaterialResultToApi(updatedMaterial));
    },

    async disableMaterial(publicId) {
      const material = await materialRepository.disableMaterial(
        publicId,
        options.mutationContext,
      );

      if (material === null) {
        return createMaterialNotFoundResponse();
      }

      return createSuccessResponse(mapMaterialResultToApi(material));
    },

    async copyMaterial(publicId) {
      const material = await materialRepository.copyMaterial(
        publicId,
        options.mutationContext,
      );

      if (material === null) {
        return createMaterialNotFoundResponse();
      }

      return createSuccessResponse(mapMaterialResultToApi(material));
    },
  };
}

export function createUnavailableMaterialService(): MaterialService {
  return {
    async listMaterials() {
      return createErrorResponse(
        MATERIAL_RUNTIME_UNAVAILABLE_CODE,
        "Material runtime is not configured.",
      );
    },
    async createMaterial() {
      return createErrorResponse(
        MATERIAL_RUNTIME_UNAVAILABLE_CODE,
        "Material runtime is not configured.",
      );
    },
    async getMaterial() {
      return createErrorResponse(
        MATERIAL_RUNTIME_UNAVAILABLE_CODE,
        "Material runtime is not configured.",
      );
    },
    async updateMaterial() {
      return createErrorResponse(
        MATERIAL_RUNTIME_UNAVAILABLE_CODE,
        "Material runtime is not configured.",
      );
    },
    async disableMaterial() {
      return createErrorResponse(
        MATERIAL_RUNTIME_UNAVAILABLE_CODE,
        "Material runtime is not configured.",
      );
    },
    async copyMaterial() {
      return createErrorResponse(
        MATERIAL_RUNTIME_UNAVAILABLE_CODE,
        "Material runtime is not configured.",
      );
    },
  };
}

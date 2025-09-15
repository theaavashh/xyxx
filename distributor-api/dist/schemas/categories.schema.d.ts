import { z } from 'zod';
export declare const CreateCategorySchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    title: string;
    sortOrder: number;
    description?: string | undefined;
    slug?: string | undefined;
}, {
    title: string;
    isActive?: boolean | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    sortOrder?: number | undefined;
}>, {
    slug: string;
    isActive: boolean;
    title: string;
    sortOrder: number;
    description?: string | undefined;
}, {
    title: string;
    isActive?: boolean | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    sortOrder?: number | undefined;
}>;
export declare const UpdateCategorySchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
}, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
}>, {
    slug: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
}, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
}>;
export declare const GetCategoriesQuerySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodEnum<["true", "false"]>>, boolean | undefined, "true" | "false" | undefined>;
    search: z.ZodOptional<z.ZodString>;
    includeProducts: z.ZodEffects<z.ZodOptional<z.ZodEnum<["true", "false"]>>, boolean, "true" | "false" | undefined>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    limit: number;
    page: number;
    sortBy: string;
    includeProducts: boolean;
    isActive?: boolean | undefined;
    search?: string | undefined;
}, {
    isActive?: "true" | "false" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    limit?: string | undefined;
    page?: string | undefined;
    sortBy?: string | undefined;
    search?: string | undefined;
    includeProducts?: "true" | "false" | undefined;
}>;
export declare const CategoryIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const BulkUpdateCategoriesSchema: z.ZodObject<{
    categoryIds: z.ZodArray<z.ZodString, "many">;
    updates: z.ZodObject<{
        isActive: z.ZodOptional<z.ZodBoolean>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
    }, {
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    categoryIds: string[];
    updates: {
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
    };
}, {
    categoryIds: string[];
    updates: {
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
    };
}>;
export type CreateCategoryData = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryData = z.infer<typeof UpdateCategorySchema>;
export type GetCategoriesQuery = z.infer<typeof GetCategoriesQuerySchema>;
export type CategoryIdParam = z.infer<typeof CategoryIdParamSchema>;
export type BulkUpdateCategoriesData = z.infer<typeof BulkUpdateCategoriesSchema>;
//# sourceMappingURL=categories.schema.d.ts.map
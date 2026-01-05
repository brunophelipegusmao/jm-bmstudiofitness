declare module "class-validator" {
  export type ValidationDecorator = (...args: unknown[]) => PropertyDecorator;
  export const IsIn: (...args: unknown[]) => PropertyDecorator;
  export const IsOptional: (...args: unknown[]) => PropertyDecorator;
  export const IsString: (...args: unknown[]) => PropertyDecorator;
}

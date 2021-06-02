import type { ASTVisitor } from '../../language/visitor';
import type {
  ValidationContext,
  SDLValidationContext,
} from '../ValidationContext';
/**
 * Known argument names
 *
 * A GraphQL field is only valid if all supplied arguments are defined by
 * that field.
 */
export declare function KnownArgumentNamesRule(
  context: ValidationContext,
): ASTVisitor;
/**
 * @internal
 */
export declare function KnownArgumentNamesOnDirectivesRule(
  context: ValidationContext | SDLValidationContext,
): ASTVisitor;
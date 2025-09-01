// Ensure registry exists, then populate via side-effect imports
import { componentRegistry } from './componentRegistry'
import '@/components/domain/basics/register'
import '@/components/domain/maps/register'

export default componentRegistry

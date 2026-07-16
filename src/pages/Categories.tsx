import ResourceManager from '../components/ResourceManager'
import { categoryConfig } from '../data/resourceConfigs'

export default function Categories(){
  return <ResourceManager {...categoryConfig()} basePath="/categories"/>
}

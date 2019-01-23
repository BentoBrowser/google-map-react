import GoogleMap from './google_map';
import { wrapper as GoogleApiWrapper } from './loaders/GoogleApiWrapper';

export default function(props) {
  return GoogleApiWrapper(props)(GoogleMap);
}

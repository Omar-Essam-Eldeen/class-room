import { Navigate } from 'react-router-dom'
import { canEnterPrivateRoom } from '../data/storage'

function ProtectedRoomRoute({ children }) {
  if (!canEnterPrivateRoom()) {
    return <Navigate to="/access-denied" replace />
  }

  return children
}

export default ProtectedRoomRoute

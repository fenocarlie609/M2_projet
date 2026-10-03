import React from 'react'
import { useParams } from 'react-router-dom';

function LoadPage() {
    const { reference } = useParams();
  return (
    <div>LoadPage - {reference}</div>
  )
}

export default LoadPage
import React from 'react'

function Search({search, setSearch}) {
    
  return (
    <div className='search'>
        <div>
            <img src="Search.svg" alt="search" />

            <input 
            type="text"
            placeholder='Search through thousands of movies'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        </div>
    </div>
  )
}

export default Search
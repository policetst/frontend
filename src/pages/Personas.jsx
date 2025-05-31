import React from 'react';
import PeopleCard from '../components/PeopleCard'
function Personas() {
  document.title = "Personas"

  return (
    <div>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

          {/* Titulo en escritorio o tablet */}
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold mt-4">Personas</h2>
            <hr className="border-t border-gray-300 my-4"/>
          </div>
          {/* Titulo en moviles */}
          <div className="block md:hidden">
            <h2 className="text-2xl font-bold flex justify-center">Personas</h2>
            <hr className="border-t border-gray-300 my-4"/>
          </div>

          <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6'>

            <PeopleCard 
            dni="98765432S"
            first_name="Federico" 
            last_name1="Garcia"
            last_name2="Lorca"
            phone_number="666777555"/>

            <PeopleCard 
            dni="98765432S"
            first_name="Federico" 
            last_name1="Garcia"
            last_name2="Lorca"
            phone_number="666777555"/>

            <PeopleCard 
            dni="98765432S"
            first_name="Federico" 
            last_name1="Garcia"
            last_name2="Lorca"
            phone_number="666777555"/>

            <PeopleCard 
            dni="98765432S"
            first_name="Federico" 
            last_name1="Garcia"
            last_name2="Lorca"
            phone_number="666777555"/>

            <PeopleCard 
            dni="98765432S"
            first_name="Federico" 
            last_name1="Garcia"
            last_name2="Lorca"
            phone_number="666777555"/>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Personas
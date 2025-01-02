import React from 'react'
import Link from 'next/link'

import { navigation } from '@/constants/navigation_paths'

export const Logo = () => {
	return (
		<Link aria-label='go to home page' href={navigation.home.path} className='relative flex w-24 overflow-hidden rounded-br-3xl rounded-tr-3xl lg:h-28 lg:w-full items-center justify-center'>
			<div className='mt-auto h-1/2 w-full rounded-tl-3xl'></div>
			<div className='absolute flex h-full w-full items-center justify-center text-center'>
				<span className='text-yellow-500 text-2xl font-bold'>Ease</span>
				<span className='text-black text-2xl font-bold'>Bill</span>
			</div>
		</Link>
	)
}
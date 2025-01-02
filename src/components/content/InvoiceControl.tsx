'use client'
import React from 'react'
import Image from 'next/image'
import { useFormContext } from 'react-hook-form'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Filter } from './Filter'
import { useForm } from '@/hooks/useForm'
import { useInvoice } from '@/hooks/useInvoice'
import { InvoiceFormValues } from '@/context/FormProviders'

export const InvoiceControl = () => {
	const targetReached = useMediaQuery('576')
	const { numberOfInvoices } = useInvoice()
	const { toggleForm } = useForm()

	const { reset } = useFormContext<InvoiceFormValues>()
	const showForm = () => {
		reset({
			sender: {
				city: '',
				country: '',
				postCode: '',
				streetAddress: '',
			},
			receiver: {
				clientStreetAddress: '',
				clientName: '',
				clientCity: '',
				clientCountry: '',
				clientEmail: '',
				clientPostCode: '',
			},
			invoiceDate: new Date(),
			paymentTerms: '30',
			projectDescription: '',
			items: [
				{
					name: '',
					price: 0,
					quantity: 0,
				},
			],
		})
		toggleForm()
	}

	return (
		<div className='flex items-center justify-between p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white'>
			<div className='flex flex-col'>
				<h1 className='text-2xl font-bold lg:text-3xl'>Invoices</h1>
				<p className='text-sm text-gray-600'>
					{targetReached ? `There are ${numberOfInvoices} total Invoices` : `${numberOfInvoices} Invoices `}
				</p>
			</div>
			
			<div className='inline-flex items-center gap-5 sm:gap-10'>
				<Filter />
				<button
					className='flex items-center justify-center rounded-full bg-blue-600 border-2 border-blue-700 p-2 py-2.5 text-xl text-white transition-colors duration-300 hover:bg-blue-700 transform hover:scale-105'
					onClick={showForm}
				>
					<div className='flex items-center gap-3'>
						<div className='flex h-8 w-8 items-center justify-center rounded-full bg-white'>
							<Image alt='' src='./assets/icon-plus.svg' width={16} height={16} />
						</div>
						<span className='text-base'>{targetReached ? 'New Invoice' : 'New'}</span>
					</div>
				</button>
			</div>
		</div>
	)
}
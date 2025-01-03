'use client'
import React, { ReactNode, useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

import { InvoiceCtx } from './InvoiceCtx'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/config/firebase'
import { InvoiceData } from './FormCtx'
import { InvoiceFormValues } from './FormProviders'

export type InvoiceDataProviderType = InvoiceData & {
	as: 'paid' | 'pending' | 'draft'
	totalPrice: number
	paymentDue: Date
	index: number
}

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useAuth()
	const [invoiceData, setInvoiceData] = useState<InvoiceDataProviderType[]>([])
	const [filteredInvoiceData, setFilteredInvoiceData] = useState<InvoiceDataProviderType[]>([])
	const [checkedItems, setCheckedItems] = useState({ pending: false, paid: false, draft: false })
	const [fetching, setIsFetching] = useState(false)

	const numberOfInvoices = filteredInvoiceData.length
	const router = useRouter()
	useEffect(() => {
		if (!user) return
		setIsFetching(true)
		const invoiceRef = doc(db, 'Invoices', user.email)
		const subscribeInvoiceData = onSnapshot(invoiceRef, doc => {
			if (!doc.exists()) {
				setIsFetching(false)
				return setInvoiceData([])
			}
			const invoiceArr = doc.data().Invoices

			const updatedInvoiceData: InvoiceDataProviderType[] = invoiceArr.map((invoice: InvoiceData, idx: number) => {
				const totalPrice = invoice.items.reduce((acc, item) => {
					const totalItemPrice = item.price! * item.quantity!
					return acc + totalItemPrice
				}, 0)
				const newDate = new Date(invoice.invoiceDate)
				const paymentTime = newDate.setDate(newDate.getDate() + parseInt(invoice.paymentTerms))
				const paymentDue = new Date(paymentTime)
				return {
					...invoice,
					totalPrice,
					paymentDue,
					index: idx,
				}
			})
			setInvoiceData(updatedInvoiceData)
			setIsFetching(false)
		})
		return () => subscribeInvoiceData()
	}, [user])

	useEffect(() => {
		if (!user) return
		const filteredArr = invoiceData.filter(item => {
			if (!checkedItems.draft && !checkedItems.pending && !checkedItems.paid) {
				return invoiceData
			} else if (checkedItems.draft && checkedItems.pending && checkedItems.paid) {
				return item.as === 'pending' || item.as === 'draft' || item.as === 'paid'
			}
			return (
				(checkedItems.draft && item.as === 'draft') ||
				(checkedItems.pending && item.as === 'pending') ||
				(checkedItems.paid && item.as === 'paid')
			)
		})
		setFilteredInvoiceData(filteredArr)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [invoiceData, checkedItems.draft, checkedItems.paid, checkedItems.pending])

	const getCurrentInvoice = (id: InvoiceDataProviderType['formId']) => {
		return invoiceData.find(invoice => invoice.formId === id)
	}

	const getData = async () => {
		if (!user) return
		const invoiceRef = doc(db, 'Invoices', user!.email)
		const Invoicesnap = await getDoc(invoiceRef)

		if (!Invoicesnap.exists()) return
		const currentInvoice = Invoicesnap.data().Invoices

		return currentInvoice
	}

	const updateSelectedInvoice = async (
		formId: InvoiceDataProviderType['formId'],
		as: 'pending' | 'paid',
		data?: InvoiceFormValues,
	) => {
		if (!user) return
		const invoiceRef = doc(db, 'Invoices', user.email)

		const editingInvoice = getCurrentInvoice(formId) as InvoiceDataProviderType
		const invoiceIndex = editingInvoice.index

		const currentInvoice = await getData()

		const updateExistingInvoice = {
			...currentInvoice[invoiceIndex],
			...data,
			invoiceDate: editingInvoice.invoiceDate,
			as,
		}
		currentInvoice[invoiceIndex] = updateExistingInvoice
		await updateDoc(invoiceRef, { Invoices: currentInvoice })
	}
	const deleteInvoice = async (formId: string) => {
		if (!user) return
		const invoiceRef = doc(db, 'Invoices', user.email)

		const Invoices = (await getData()) as InvoiceDataProviderType[]
		const editingInvoice = getCurrentInvoice(formId) as InvoiceDataProviderType

		const deleteField = Invoices.filter(item => !(item.formId === editingInvoice.formId))
		updateDoc(invoiceRef, { Invoices: deleteField })
		router.back()
	}

	const values = {
		filteredInvoiceData,
		checkedItems,
		fetching,
		numberOfInvoices,
		getCurrentInvoice,
		updateSelectedInvoice,
		setCheckedItems,
		deleteInvoice,
	}
	return <InvoiceCtx.Provider value={values}>{children}</InvoiceCtx.Provider>
}

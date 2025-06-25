'use client'

import { PublicKey } from '@solana/web3.js'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram, useCounterProgramAccount } from './counter-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CounterCreate() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const { createEntry } = useCounterProgram()
  const { publicKey } = useWallet()

  const isFormValid = title.trim() !== '' && message.trim() !== ''

  const handleCreateJournalEntry = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey })
    }
  }

  if (!publicKey) {
    return <p> Connect your wallet.</p>
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-2"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full mb-2"
      />
      <Button onClick={handleCreateJournalEntry} disabled={!isFormValid || createEntry.isPending} className="w-full">
        {createEntry.isPending ? 'Creating...' : 'Create Journal'}
      </Button>
      {createEntry.isError && (
        <div className="alert alert-error mt-2">
          <span>Error creating journal: {createEntry.error.message}</span>
        </div>
      )}
      {createEntry.isSuccess && (
        <div className="alert alert-success mt-2">
          <span>Journal created successfully!</span>
          <ExplorerLink path={`account/${createEntry.data}`} label={ellipsify(createEntry.data)} className="ml-2" />
        </div>
      )}
    </div>
  )
}

export function CounterList() {
  const { accounts, getProgramAccount } = useCounterProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CounterCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CounterCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCounterProgramAccount({
    account,
  })

  const { publicKey } = useWallet()
  const [message, setMessage] = useState('')
  const title = accountQuery.data?.title || 'No title'

  const isFormValid = message.trim() !== ''
  const handleUpdate = () => {
    if (publicKey && isFormValid) {
      updateEntry.mutateAsync({ title, message, owner: publicKey })
    }
  }

  if (!publicKey) {
    return <p> Connect your wallet.</p>
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title cursor-pointer" onClick={() => accountQuery.refetch()}>
          {accountQuery.data?.title}
        </h2>
        <p>{accountQuery.data?.message}</p>
        <div className="card-actions justify-end">
          <textarea
            placeholder="Update message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="textarea textarea-bordered w-full mb-2"
          />
          <Button onClick={handleUpdate} disabled={!isFormValid || updateEntry.isPending} className="w-full">
            {updateEntry.isPending ? 'Updating...' : 'Update Journal'}
          </Button>
          {updateEntry.isError && (
            <div className="alert alert-error mt-2">
              <span>Error updating journal: {updateEntry.error.message}</span>
            </div>
          )}
          {updateEntry.isSuccess && (
            <div className="alert alert-success mt-2">
              <span>Journal updated successfully!</span>
            </div>
          )}

          <Button
            onClick={
              () => {
                const title = accountQuery.data?.title;
                if (title) {
                  return deleteEntry.mutate(title)
                }
              }
            }
            disabled={deleteEntry.isPending}
            className="w-full mt-2"
          >
            {deleteEntry.isPending ? 'Deleting...' : 'Delete Journal'}
          </Button>
        </div>
      </div>
    </div>
  )
}

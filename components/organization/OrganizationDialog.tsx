"use client"

import { useState } from "react"
import { Organization } from "@/types/organization"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  organization?: Organization
  type?: "edit" | "add"
  trigger?: React.ReactNode
}

export default function OrganizationDialog({ organization, type = "edit", trigger }: Props) {
  const [name, setName] = useState(organization?.name ?? "")
  const [email, setEmail] = useState(organization?.email ?? "")
  const [phone, setPhone] = useState(organization?.phone ?? "")
  const [address, setAddress] = useState(organization?.address ?? "")
  const [orgType, setOrgType] = useState(organization?.type ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const body = {
      name,
      email,
      phone,
      address,
      type: orgType,
    }

    if (type === "edit") {
      await fetch(`/api/super-admin/organizations/${organization?.organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/super-admin/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    }
    window.location.reload()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button size="sm" variant={type === "edit" ? "outline" : "default"}>
            {type === "edit" ? "Edit" : "Add Organization"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{type === "edit" ? "Edit Organization" : "Add Organization"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={orgType} onValueChange={setOrgType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="COLLEGE">College</SelectItem>
                  <SelectItem value="HOSPITAL">Hospital</SelectItem>
                  <SelectItem value="GOVERNMENT">Government</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{type === "edit" ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

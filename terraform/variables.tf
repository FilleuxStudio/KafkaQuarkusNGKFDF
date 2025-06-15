variable "project" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "zone" {
  description = "GCP zone"
  type        = string
}

variable "network" {
  description = "Name of the VPC network to create/use"
  type        = string
  default     = "default"
}

variable "instance_name" {
  description = "Name of the Compute Engine VM"
  type        = string
}

variable "machine_type" {
  description = "Machine type for the VM"
  type        = string
  default     = "e2-standard-2"
}

variable "image" {
  description = "Boot disk image (project/family or project/image)"
  type        = string
  default     = "ubuntu-os-cloud/ubuntu-2004-lts"
}

variable "ssh_username" {
  description = "Username for SSH access"
  type        = string
}

variable "ssh_public_key_file" {
  description = "Path to the SSH public key file"
  type        = string
}

variable "allowed_ports" {
  description = "List of TCP ports (or ranges) to open"
  type        = list(string)
}

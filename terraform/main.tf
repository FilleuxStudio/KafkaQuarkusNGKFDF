provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}

# 1. If you want the GCP default VPC’s default subnet:
data "google_compute_subnetwork" "default" {
  name    = var.network
  region  = var.region
  project = var.project
}

resource "google_compute_firewall" "allow-all-ports" {
  name    = "allow-all-ports"
  network = var.network

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "3000", "3002", "8080-9099", "16686", "14250"]  # adjust to your Docker ports
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_instance" "vm" {
  name         = "monitoring-vm"
  machine_type = "e2-standard-2"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network    = var.network
    subnetwork = data.google_compute_subnetwork.default.self_link
    access_config {}
  }

  metadata = {
    ssh-keys = "noah:${file("~/.ssh/id_ed25519.pub")}"
  }
}

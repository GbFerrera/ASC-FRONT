"use client"

import * as React from "react"
import Image from "next/image"
import {
  BarChart3,
  Settings
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"

import { FaUsers, FaFileAlt, FaMapMarkedAlt, FaClipboardList } from "react-icons/fa";
import { MdAccountBalance, MdPerson, MdCategory } from "react-icons/md";

const data = {
  navMain: [
    {
      title: "Gerenciamento",
      url: "/",
      icon: BarChart3,
      isActive: true,
      color: "#236F5D",
      items: [
        {
          title: "Certidões",
          url: "/",
          icon: FaFileAlt,
          color: "#236F5D"
        },
        {
          title: "Estados",
          url: "/states",
          icon: FaMapMarkedAlt,
          color: "#236F5D"
        },
        {
          title: "Categorias",
          url: "/categories",
          icon: MdCategory,
          color: "#236F5D"
        },
        {
          title: "Pedidos",
          url: "/orders",
          icon: FaClipboardList,
          color: "#236F5D"
        }
      ],
    },
    {
      title: "Clientes",
      url: "/customers",
      icon: MdPerson,
      color: "#236F5D",
      items: [
        {
          title: "Lista de Clientes",
          url: "/customers",
          color: "#236F5D"
        }
      ],
    },
    {
      title: "Bancos",
      url: "/banks",
      icon: MdAccountBalance,
      color: "#236F5D",
      items: [
        {
          title: "Lista de Bancos",
          url: "/banks",
          color: "#236F5D"
        },
        {
          title: "Adicionar Banco",
          url: "/banks/new",
          color: "#236F5D"
        }
      ],
    },
    {
      title: "Usuários",
      url: "/users",
      icon: FaUsers,
      color: "#236F5D",
      items: [
        {
          title: "Gerenciar Usuários",
          url: "/users",
          color: "#236F5D"
        },
        {
          title: "Adicionar Usuário",
          url: "/users/new",
          color: "#236F5D"
        },
      ],
    },
    {
      title: "Configurações",
      url: "/settings",
      icon: Settings,
      color: "#236F5D",
      items: [
        {
          title: "Perfil",
          url: "/settings/profile",
          color: "#236F5D"
        },
        {
          title: "Sistema",
          url: "/settings/system",
          color: "#236F5D"
        },
      ],
    }
  ],

}



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="shadow-sm" {...props}>
      <SidebarHeader className="bg-[#236F5D]">
        <div className="flex items-center justify-center px-4 py-4">
          {/* Este ícone sempre aparece quando a sidebar está fechada */}
          <div className="absolute left-0 right-0 mx-auto w-10 sidebar-collapsed-only">
            <Image
              src="/icon.svg"
              alt="Atlas Certidões"
              width={30}
              height={30}
              priority
              className="object-contain mx-auto"
            />
          </div>
          
          {/* Este logo aparece quando a sidebar está aberta */}
          <div className="w-28 sidebar-expanded-only">
            <Image
              src="/atlas-logo.svg"
              alt="Atlas Certidões"
              width={160}
              height={70}
              priority
              className="object-contain"
            />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-white">
        <div className="py-2">
          <NavMain items={data.navMain} />
        </div>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}


interface TitlePage{

  children: string,
  description: string

}


export function Title({children,description} : TitlePage){


return(

<div>
<h1 className="font-bold text-2xl sm:text-3xl">{children}</h1>
<p className="mt-3">{description}</p>

</div>

)




}
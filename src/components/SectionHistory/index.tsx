import Image from "next/image";

export default function SectionHistory() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-20 text-justify">
        <article className="w-auto">
          <h2 className="mb-6 text-center text-3xl font-bold text-[#C2A537]">
            Nossa História
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-white">
            Fundada em 2010, a JM Studio Fitness nasceu do sonho de proporcionar
            um espaço onde saúde, bem-estar e comunidade se encontram. Ao longo
            dos anos, temos crescido e evoluído, sempre mantendo nosso
            compromisso com a excelência e a satisfação dos nossos alunos. Nossa
            missão é inspirar e apoiar cada indivíduo em sua jornada fitness,
            oferecendo um ambiente acolhedor, equipamentos de ponta e uma equipe
            dedicada de profissionais. Venha fazer parte da nossa história e
            transformar sua vida conosco!
          </p>
          <Image
            src="/banner-01.png"
            alt="Descrição da imagem"
            width={500}
            height={300}
            className="mx-auto mt-6"
          />
          <p className="mt-4 text-center text-sm text-gray-400">
            Imagem ilustrativa da nossa academia
          </p>
        </article>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          <article>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim
            delectus a molestiae nam corrupti quaerat cum quibusdam possimus.
            Magni quaerat culpa molestiae ipsum ipsam nisi illo reiciendis
            magnam est beatae?
          </article>
          <article>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Commodi
            aliquam dignissimos quam sed distinctio natus eos in? Nostrum
            facilis ipsam excepturi unde sequi, tempora, dignissimos quae vel,
            quos fugiat dicta!
          </article>
          <article>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum
            officia, nobis quis aliquam neque eligendi optio amet pariatur
            voluptates vel ex, expedita adipisci aut illum sequi! Consectetur
            laboriosam quasi natus!
          </article>
          <article>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Error
            quisquam optio earum ipsa? Illum rem explicabo soluta debitis
            pariatur, nostrum suscipit ab architecto sit animi veritatis,
            voluptas nobis error doloribus?
          </article>
          <article>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus iusto
            optio, quos commodi voluptate cupiditate ullam soluta, cum deserunt
            unde nostrum maiores? Sunt molestiae velit impedit maxime. Quis,
            aperiam ab!
          </article>
          <article>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
            veritatis debitis accusamus impedit voluptas voluptatem optio
            adipisci ipsum vero porro exercitationem enim sequi expedita nihil,
            aut, asperiores dignissimos cumque praesentium.
          </article>
        </div>
      </section>
    </>
  );
}

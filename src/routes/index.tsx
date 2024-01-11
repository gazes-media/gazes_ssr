import { A } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { HighLighted, getFeatured, statusEnum } from "~/utils/api";

export default function Home() {
  const [featured, setFeatured] = createSignal<HighLighted>({
    id: 0,
    title: "",
    title_english: "",
    title_romanji: "",
    title_french: undefined,
    others: "",
    type: "",
    status: statusEnum.onGoing,
    popularity: 0,
    url: "",
    genres: [],
    url_image: "",
    score: "",
    start_date_year: "",
    nb_eps: "",
    synopsis: "",
    coverUrl: "",
    episodes: []
  });
  getFeatured().then(setFeatured);
  return (
    <main>
     <img src={featured().coverUrl} alt="featured" />
      <h1 class="text-3xl text-center font-bold text-gray-900">
        {featured()?.title}
      </h1>
      <p class="text-xl text-center text-gray-700">
        {featured()?.synopsis}
      </p>
      <p class="text-center">
        <A
          href={featured().url}
          class="inline-block bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mt-8"
        >
          {featured().title}
        </A>
      </p>
      
    </main>
  );
}

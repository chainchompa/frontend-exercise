import { useEffect, useState } from "react";
import { fetchAllPokemon, fetchPokemonDetailsByName, fetchEvolutionChainById, fetchPokemonSpeciesByName } from "./api";

function App() {
    const [pokemonIndex, setPokemonIndex] = useState([])
    const [pokemon, setPokemon] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [pokemonDetails, setPokemonDetails] = useState()

    useEffect(() => {
        const fetchPokemon = async () => {
            const {results: pokemonList} = await fetchAllPokemon()

            setPokemon(pokemonList)
            setPokemonIndex(pokemonList)
        }

        fetchPokemon().then(() => {
            /** noop **/
        })
    }, [])

    const onSearchValueChange = (event) => {
        const value = event.target.value
        setSearchValue(value)

        setPokemon(
            pokemonIndex.filter(monster => monster.name.includes(value))
        )
    }

    const getEvolutionChain = (evolutionData) =>{
        const evolutions = [];
        let evolutionChain = evolutionData.chain;
        
        evolutions.push(evolutionChain.species.name);
        
        while (evolutionChain.evolves_to?.[0]) {
            evolutionChain = evolutionChain.evolves_to[0];
            evolutions.push(evolutionChain.species.name);
        }
        
        return evolutions;
    }

    const onGetDetails = (name) => async () => {
        const details = await fetchPokemonDetailsByName(name);
        const species = await fetchPokemonSpeciesByName(name);
        
        const evolutionChainId = species.evolution_chain.url.match(/\/(\d+)\/?$/)[1];
        const evolutionData = await fetchEvolutionChainById(evolutionChainId);
        
        const transformedDetails = {
            ...details,
            moves: details.moves.slice(0, 4),
            evolutions: getEvolutionChain(evolutionData)
        };
        
        setPokemonDetails(transformedDetails);
    }

    return (
        <div className={'pokedex__container'}>
            <div className={'pokedex__search-input'}>
                <input value={searchValue} onChange={onSearchValueChange} placeholder={'Search Pokemon'}/>
            </div>
            <div className={'pokedex__content'}>
                {pokemon.length > 0 ? (
                    <div className={'pokedex__search-results'}>
                        {
                            pokemon.map(monster => {
                                return (
                                    <div className={'pokedex__list-item'} key={monster.name}>
                                        <p>
                                            {monster.name}
                                        </p>
                                        <button onClick={onGetDetails(monster.name)}>Get Details</button>
                                    </div>
                                )
                            })
                        }
                    </div>
                ) : (
                    <div className={'pokedex__no-results'}>
                        <p>No Results Found</p>
                    </div>
                )}
                {
                    pokemonDetails && (
                        <div className={'pokedex__details'}>
                            <p>{pokemonDetails.name}</p>
                            <p>Types</p>
                            <ul>{pokemonDetails.types.map(type => (<li key={type.type.name}>{type.type.name}</li>))}</ul>
                            <p>Moves</p>
                            <ul>{pokemonDetails.moves.map(move => (<li key={move.move.name}>{move.move.name}</li>))}</ul>
                            {pokemonDetails.evolutions && pokemonDetails.evolutions.length > 0 && (
                               <>
                                <p>Evolutions</p>
                                <ul>{pokemonDetails.evolutions.map(evolution => (<li key={evolution}>{evolution}</li>))}</ul>
                               </>
                            )}
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default App;

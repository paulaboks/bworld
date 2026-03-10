export abstract class Component {
	__component = true;
}

export abstract class SerializableComponent extends Component {
	abstract serialize(): unknown;
	// right, this is static you cant do this,,
	// abstract deserialize<T>(data: unknown): T;
}

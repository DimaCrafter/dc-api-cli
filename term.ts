// Utils
type GetProperty<Object, Property extends keyof Object> = Object[Property];

// Registering action
type IParams = {
	[key: string]: {
		/** Parameter name only for help page */
		name: string,
		/** Default value */
		default: any
	}
}
type IArgs = {
	[key: string]: {
		/** Type of value, for example `Number`, `String`, etc. */
		type: any,
		/** Full argument name without `--` */
		name: string,
		/** Short argument name without `-` */
		short: string,
		/** Default value */
		default: any
	}
}

type Opts<Params extends IParams, Args extends IArgs> = {
	[key in keyof Params]: string
} & {
	[key in keyof Args]: InstanceType<GetProperty<Args[key], 'type'>>
};

interface TerminalAction<Params extends IParams, Args extends IArgs> {
	name: string;
	params: Params;
	args: Args;
	handler (opts: Opts<Params, Args>): Promise<any> | void;
}

export const Terminal = new class Terminal {
	RESET: string;
	BOLD: string;

	/** Returns ANSI coloring symbols sequence */
	ansi (color: number, isBG: boolean): string { return <string> null; }

	/** Clear upper lines */
	clearLine (lines: number) {}

	/** Just prints text to stdout with new line symbol */
	print (line: string) {}

	/** Register terminal action */
	registerAction<Params extends IParams, Args extends IArgs> (action: TerminalAction<Params, Args>) {}

	dispatch () {}

	/** Executes registered action by it's name with given options */
	invokeAction (name: string, opts: object) {}
};
